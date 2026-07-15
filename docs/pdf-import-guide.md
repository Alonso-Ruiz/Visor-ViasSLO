# Guia para importar PDFs al visor

Este flujo sirve para copiar automaticamente los PDFs descargados desde Google Drive hacia la carpeta `pdf/` del proyecto.

## Preparar la carpeta de origen

Descargar los PDFs en una carpeta local, por ejemplo:

```powershell
C:\Users\Alonso\Desktop\PDFs_Vias
```

No importa si dentro hay mas subcarpetas. El script busca todos los archivos `.pdf` de forma recursiva.

## Ejecutar

Desde la raiz del proyecto:

```powershell
.\scripts\import-pdfs.ps1 -SourceDir "C:\Users\Alonso\Desktop\PDFs_Vias"
```

Por defecto:

- Copia solo archivos `.pdf`.
- Recorre todas las subcarpetas.
- Copia hacia `pdf/`.
- No borra archivos.
- No reemplaza PDFs existentes.
- Genera reportes en `docs/pdf-import-reports/`.

## Reemplazar archivos existentes

Si necesitas reemplazar PDFs con el mismo nombre:

```powershell
.\scripts\import-pdfs.ps1 -SourceDir "C:\Users\Alonso\Desktop\PDFs_Vias" -Overwrite
```

## Reportes generados

El script crea archivos `.csv` con:

- PDFs copiados o saltados.
- PDFs duplicados en la carpeta de origen.
- PDFs esperados por `layers/red_vial_1.js` que no estan en `pdf/`.
- PDFs presentes en `pdf/` pero no referenciados por el layer.

El resumen queda en:

```text
docs/pdf-import-reports/pdf-summary-FECHA-HORA.txt
```

## Despues de importar

Revisar primero el reporte de faltantes. Si el reporte queda en cero, la carpeta `pdf/` esta alineada con los nombres esperados por el visor.
