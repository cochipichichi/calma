
# Integración con Google Sheets (Opcional)

Esta versión permite **exportar a CSV** (sin internet) y **enviar a Google Sheets** (si configuras un WebApp de Apps Script).

## Paso rápido (CSV)
1. Abre **Tu calma diaria** → botón **⬇️ Exportar CSV**.  
2. Se descarga `calma_panel_YYYY-MM-DD.csv` listo para subir a Google Sheets.

## Enviar a Google Sheets (Apps Script)
1. Crea un script de Google (Apps Script) en blanco.
2. Pega este código base:

```javascript
function doPost(e){
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.openByUrl('URL_DE_TU_SHEET');
  const sh = ss.getSheetByName('calma') || ss.insertSheet('calma');
  sh.appendRow([new Date(), data.date, data.user, data.partner, JSON.stringify(data.tasks), data.notes]);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}
```

3. **Publicar** → **Implementar como aplicación web** → acceso **Cualquiera con el enlace**. Copia la URL.
4. En el proyecto, duplica `assets/config/sheets.example.json` como `assets/config/sheets.json` y edita:
```json
{
  "GOOGLE_SHEETS_WEBAPP_URL": "PEGAR_AQUI_LA_URL",
  "ENABLED": true
}
```

> Seguridad: puedes restringir el acceso a usuarios con cuenta Google si prefieres, ajustando la publicación del WebApp.
