param(
    [Parameter(Mandatory = $true)]
    [string]$SourceDir,

    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,

    [switch]$Overwrite
)

$ErrorActionPreference = "Stop"

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

    if ([System.IO.Path]::GetExtension($leaf) -eq "") {
        $leaf = "$leaf.pdf"
    }

    if ([System.IO.Path]::GetExtension($leaf).ToLowerInvariant() -ne ".pdf") {
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

$layerText = Get-Content -LiteralPath $layerPath -Raw -Encoding UTF8
$match = [regex]::Match($layerText, "var\s+json_red_vial_1\s*=\s*(\{.*\})\s*;?\s*$", [System.Text.RegularExpressions.RegexOptions]::Singleline)
if (-not $match.Success) {
    throw "No se pudo leer el JSON dentro de layers\red_vial_1.js"
}

$layerJson = $match.Groups[1].Value | ConvertFrom-Json
$expectedNames = New-Object "System.Collections.Generic.HashSet[string]" ([StringComparer]::OrdinalIgnoreCase)
foreach ($feature in $layerJson.features) {
    $fromLinkVercel = Get-ExpectedPdfName $feature.properties.LINKVERCEL
    if ($fromLinkVercel) {
        [void]$expectedNames.Add($fromLinkVercel)
    }

    $fromLink = Get-ExpectedPdfName $feature.properties.LINK
    if ($fromLink) {
        [void]$expectedNames.Add($fromLink)
    }
}

$destinationAfter = Get-ChildItem -LiteralPath $pdfDir -File -Filter "*.pdf" -ErrorAction SilentlyContinue
$destinationAfterNames = New-Object "System.Collections.Generic.HashSet[string]" ([StringComparer]::OrdinalIgnoreCase)
foreach ($file in $destinationAfter) {
    [void]$destinationAfterNames.Add($file.Name)
}

$missingReport = foreach ($name in ($expectedNames | Sort-Object)) {
    if (-not $destinationAfterNames.Contains($name)) {
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
$missingReportPath = Join-Path $reportDir "pdf-missing-$timestamp.csv"
$unmatchedReportPath = Join-Path $reportDir "pdf-unmatched-$timestamp.csv"
$summaryPath = Join-Path $reportDir "pdf-summary-$timestamp.txt"

$copyReport | Export-Csv -LiteralPath $copyReportPath -NoTypeInformation -Encoding UTF8
$duplicateReport | Export-Csv -LiteralPath $duplicateReportPath -NoTypeInformation -Encoding UTF8
$missingReport | Export-Csv -LiteralPath $missingReportPath -NoTypeInformation -Encoding UTF8
$unmatchedReport | Export-Csv -LiteralPath $unmatchedReportPath -NoTypeInformation -Encoding UTF8

$copiedCount = ($copyReport | Where-Object { $_.Status -eq "copied" }).Count
$overwrittenCount = ($copyReport | Where-Object { $_.Status -eq "overwritten" }).Count
$skippedCount = ($copyReport | Where-Object { $_.Status -eq "skipped_exists" }).Count
$duplicateCount = @($duplicateReport).Count
$missingCount = @($missingReport).Count
$unmatchedCount = @($unmatchedReport).Count

$summary = @"
PDF import summary
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Source: $sourcePath
Destination: $pdfDir

Source PDFs found: $($sourcePdfs.Count)
Copied: $copiedCount
Overwritten: $overwrittenCount
Skipped because already existed: $skippedCount
Duplicate source entries: $duplicateCount
Expected PDFs from layer: $($expectedNames.Count)
Missing expected PDFs: $missingCount
PDFs in destination not referenced by layer: $unmatchedCount

Reports:
- $copyReportPath
- $duplicateReportPath
- $missingReportPath
- $unmatchedReportPath
"@

Set-Content -LiteralPath $summaryPath -Value $summary -Encoding UTF8
Write-Output $summary
Write-Output "Summary saved at: $summaryPath"
