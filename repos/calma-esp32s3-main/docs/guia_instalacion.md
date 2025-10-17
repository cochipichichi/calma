# Guía de instalación — Proyecto CALMA v1

## 1) Hardware
- SUNTON ESP32‑S3 2432S028 (pantalla 2,8″)
- MAX98357A (I²S amplificador) → altavoz / transductor óseo
- PCM5102A (I²S DAC) → jack 3.5mm (audífonos)
- Micrófono MEMS INMP441 (opcional para v2 adaptativa)
- Batería LiPo + TP4056 + switch
- Impresión 3D: `3d/carcasa_calma_v1.stl`

### Cableado I²S (compartido)
- BCLK → GPIO 26
- LRCLK → GPIO 25
- DIN (SD) → GPIO 22
Alimenta MAX98357A y PCM5102A con 5V/3.3V según módulo (ver hoja técnica). **No** unir salidas analógicas entre sí.

## 2) Firmware
- Abre `firmware/CALMA_v1.ino` en Arduino IDE o PlatformIO.
- Selecciona **ESP32S3 Dev Module** y PSRAM Enabled.
- Sube el sketch.

## 3) Uso básico
- Al encender, aparece **pantalla táctil** con botones:
  - Tipo de ruido: Blanco / Rosa / Marrón / Notch
  - Volumen ±
  - Temporizador 5/10/20/30 min
  - 🎯 Ajustar frecuencia tinnitus (`f_tin`) con slider o barrido
  - 💾 Guardar Preset (Calma / Descanso / Ola)
- **Panel Web**: conéctate al Wi‑Fi `CALMA-BELEN` (pass `calma1234`)
  - Abre `http://192.168.4.1/` para el panel accesible
  - Idénticos controles + modo Alto Contraste + Texto Grande

## 4) Diagnóstico de frecuencia (barrido)
- Abre “🎯 Coincidir tono” y ajusta hasta igualar el zumbido.
- Guarda para que el modo **Notch** use esa `f_tin`.

## 5) Registro (opcional)
- Usa `docs/hoja_registro_sheets.xlsx` para anotar sesiones
- Puedes activar envío a Google Sheets más adelante (v2)

## 6) Notas
- Si escuchas fatiga o molestia, **pausa** la sesión.
- Mantén buena ventilación de la carcasa y evita cortos.
