param(
    [Parameter(Mandatory = $true)]
    [string]$SourceDir,

    [string]$ProjectRoot = "",

    [switch]$Overwrite,

    [switch]$ReportOnly
)

$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($scriptDir)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if ([string]::IsNullOrWhiteSpace($scriptDir)) {
    $scriptDir = (Get-Location).Path
}
if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = (Resolve-Path (Join-Path $scriptDir "..")).Path
}

function Resolve-FullPath {
    param([Parameter(Mandatory = $true)][string]$Path)
    return (Resolve-Path -LiteralPath $Path).Path
}

function Get-ExpectedPdfName {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $null
    }

    $clean = $Value.Trim()
    if ($clean -match "^(https?:)?//") {
        return $null
    }

    $clean = $clean -replace "\\", "/"
    $leaf = Split-Path -Leaf $clean
    if ([string]::IsNullOrWhiteSpace($leaf)) {
        return $null
    }

    if ($leaf -notmatch "\.pdf$") {
        $leaf = "$leaf.pdf"
    }

    if ($leaf -notmatch "\.pdf$") {
        return $null
    }

    return $leaf
}

$sourcePath = Resolve-FullPath $SourceDir
$projectPath = Resolve-FullPath $ProjectRoot
$pdfDir = Join-Path $projectPath "pdf"
$layerPath = Join-Path $projectPath "layers\red_vial_1.js"
$reportDir = Join-Path $projectPath "docs\pdf-import-reports"

if (-not (Test-Path -LiteralPath $pdfDir)) {
    New-Item -ItemType Directory -Path $pdfDir | Out-Null
}

if (-not (Test-Path -LiteralPath $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir | Out-Null
}

if (-not (Test-Path -LiteralPath $layerPath)) {
    throw "No se encontro el archivo esperado: $layerPath"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

$sourcePdfs = Get-ChildItem -LiteralPath $sourcePath -Recurse -File -Filter "*.pdf"
$sourceNames = New-Object "System.Collections.Generic.HashSet[string]" ([StringComparer]::OrdinalIgnoreCase)
foreach ($file in $sourcePdfs) {
    [void]$sourceNames.Add($file.Name)
}

$destinationBefore = Get-ChildItem -LiteralPath $pdfDir -File -Filter "*.pdf" -ErrorAction SilentlyContinue
$destinationNames = New-Object "System.Collections.Generic.HashSet[string]" ([StringComparer]::OrdinalIgnoreCase)
foreach ($file in $destinationBefore) {
    [void]$destinationNames.Add($file.Name)
}

$duplicateGroups = $sourcePdfs | Group-Object Name | Where-Object { $_.Count -gt 1 }
$duplicateReport = foreach ($group in $duplicateGroups) {
    foreach ($item in $group.Group) {
        [pscustomobject]@{
            FileName = $group.Name
            Count = $group.Count
            SourcePath = $item.FullName
            SizeBytes = $item.Length
        }
    }
}

$copyReport = New-Object System.Collections.Generic.List[object]
foreach ($file in $sourcePdfs) {
    $targetPath = Join-Path $pdfDir $file.Name
    $exists = Test-Path -LiteralPath $targetPath

    if ($ReportOnly) {
        $copyReport.Add([pscustomobject]@{
            Status = $(if ($exists) { "report_only_exists" } else { "report_only_new" })
            FileName = $file.Name
            SourcePath = $file.FullName
            TargetPath = $targetPath
            SizeBytes = $file.Length
        })
        continue
    }

    if ($exists -and -not $Overwrite) {
        $copyReport.Add([pscustomobject]@{
            Status = "skipped_exists"
            FileName = $file.Name
            SourcePath = $file.FullName
            TargetPath = $targetPath
            SizeBytes = $file.Length
        })
        continue
    }

    Copy-Item -LiteralPath $file.FullName -Destination $targetPath -Force:$Overwrite
    [void]$destinationNames.Add($file.Name)

    $copyReport.Add([pscustomobject]@{
        Status = $(if ($exists) { "overwritten" } else { "copied" })
        FileName = $file.Name
        SourcePath = $file.FullName
        TargetPath = $targetPath
        SizeBytes = $file.Length
    })
}

$expectedNames = New-Object "System.Collections.Generic.HashSet[string]" ([StringComparer]::OrdinalIgnoreCase)

function Add-ExpectedNamesFromLayer {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    $layerText = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    $match = [regex]::Match($layerText, "var\s+json_[A-Za-z0-9_]+\s*=\s*(\{.*\})\s*;?\s*$", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if (-not $match.Success) {
        throw "No se pudo leer el JSON dentro de $Path"
    }

    foreach ($linkMatch in [regex]::Matches($layerText, '"LINKVERCEL"\s*:\s*"([^"]+)"')) {
        $fromLinkVercel = Get-ExpectedPdfName $linkMatch.Groups[1].Value
        if ($fromLinkVercel) {
            [void]$expectedNames.Add($fromLinkVercel)
        }
    }

    foreach ($linkMatch in [regex]::Matches($layerText, '"LINK"\s*:\s*"([^"]+)"')) {
        $fromLink = Get-ExpectedPdfName $linkMatch.Groups[1].Value
        if ($fromLink) {
            [void]$expectedNames.Add($fromLink)
        }
    }
}

Add-ExpectedNamesFromLayer -Path (Join-Path $projectPath "layers\red_vial_1.js")
Add-ExpectedNamesFromLayer -Path (Join-Path $projectPath "layers\Secciones_Viales_3_0.js")
Add-ExpectedNamesFromLayer -Path (Join-Path $projectPath "layers\Secciones_Viales_2.js")
Add-ExpectedNamesFromLayer -Path (Join-Path $projectPath "layers\PlantasdeAlamedasypasajes_1.js")
[void]$expectedNames.Add("VLS-AL-P11_Alameda_Jose_Carlos_Mariategui.pdf")

$destinationAfter = Get-ChildItem -LiteralPath $pdfDir -File -Filter "*.pdf" -ErrorAction SilentlyContinue

if (-not $ReportOnly) {
    $manifestPath = Join-Path $projectPath "js\pdf-manifest.js"
    $manifestNames = @($destinationAfter | Sort-Object Name | ForEach-Object { $_.Name })
    $manifestJson = $manifestNames | ConvertTo-Json -Depth 1
    Set-Content -LiteralPath $manifestPath -Value "window.PDF_MANIFEST = $manifestJson;" -Encoding UTF8
}

$destinationAfterNames = New-Object "System.Collections.Generic.HashSet[string]" ([StringComparer]::OrdinalIgnoreCase)
foreach ($file in $destinationAfter) {
    [void]$destinationAfterNames.Add($file.Name)
}

$missingReport = foreach ($name in ($expectedNames | Sort-Object)) {
    if (-not $destinationAfterNames.Contains($name)) {
        [pscustomobject]@{ ExpectedFileName = $name }
    }
}

$missingSourceReport = foreach ($name in ($expectedNames | Sort-Object)) {
    if (-not $sourceNames.Contains($name)) {
        [pscustomobject]@{ ExpectedFileName = $name }
    }
}

$unmatchedReport = foreach ($file in ($destinationAfter | Sort-Object Name)) {
    if (-not $expectedNames.Contains($file.Name)) {
        [pscustomobject]@{
            FileName = $file.Name
            FullPath = $file.FullName
            SizeBytes = $file.Length
        }
    }
}

$copyReportPath = Join-Path $reportDir "pdf-copy-$timestamp.csv"
$duplicateReportPath = Join-Path $reportDir "pdf-duplicates-$timestamp.csv"
$missingSourceReportPath = Join-Path $reportDir "pdf-missing-source-$timestamp.csv"
$missingReportPath = Join-Path $reportDir "pdf-missing-$timestamp.csv"
$unmatchedReportPath = Join-Path $reportDir "pdf-unmatched-$timestamp.csv"
$summaryPath = Join-Path $reportDir "pdf-summary-$timestamp.txt"

$copyReport | Export-Csv -LiteralPath $copyReportPath -NoTypeInformation -Encoding UTF8
$duplicateReport | Export-Csv -LiteralPath $duplicateReportPath -NoTypeInformation -Encoding UTF8
$missingSourceReport | Export-Csv -LiteralPath $missingSourceReportPath -NoTypeInformation -Encoding UTF8
$missingReport | Export-Csv -LiteralPath $missingReportPath -NoTypeInformation -Encoding UTF8
$unmatchedReport | Export-Csv -LiteralPath $unmatchedReportPath -NoTypeInformation -Encoding UTF8

$copiedCount = ($copyReport | Where-Object { $_.Status -eq "copied" }).Count
$overwrittenCount = ($copyReport | Where-Object { $_.Status -eq "overwritten" }).Count
$skippedCount = ($copyReport | Where-Object { $_.Status -eq "skipped_exists" }).Count
$reportOnlyNewCount = ($copyReport | Where-Object { $_.Status -eq "report_only_new" }).Count
$reportOnlyExistsCount = ($copyReport | Where-Object { $_.Status -eq "report_only_exists" }).Count
$duplicateCount = @($duplicateReport).Count
$missingSourceCount = @($missingSourceReport).Count
$missingCount = @($missingReport).Count
$unmatchedCount = @($unmatchedReport).Count

$summary = @"
PDF import summary
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Source: $sourcePath
Destination: $pdfDir

Source PDFs found: $($sourcePdfs.Count)
Report only: $ReportOnly
Copied: $copiedCount
Overwritten: $overwrittenCount
Skipped because already existed: $skippedCount
Report-only new PDFs: $reportOnlyNewCount
Report-only existing PDFs: $reportOnlyExistsCount
Duplicate source entries: $duplicateCount
Expected PDFs from layer: $($expectedNames.Count)
Missing expected PDFs in source: $missingSourceCount
Missing expected PDFs: $missingCount
PDFs in destination not referenced by layer: $unmatchedCount

Reports:
- $copyReportPath
- $duplicateReportPath
- $missingSourceReportPath
- $missingReportPath
- $unmatchedReportPath
"@

Set-Content -LiteralPath $summaryPath -Value $summary -Encoding UTF8
Write-Output $summary
Write-Output "Summary saved at: $summaryPath"
