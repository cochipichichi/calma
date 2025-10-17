# NotchLab — Música con entalle (Notched Audio)
App web + opción ESP32 para aplicar un notch (atenuación) alrededor de la frecuencia del tinnitus.

## Modos
- **WebAudio** (recomendado): procesa audio del navegador (archivos locales o micrófono).
- **ESP32 I²S (opcional):** salida a MAX98357A/PCM5102A para pruebas sin PC.

## Recomendación
Probar atenuaciones de 5/10/15 dB, con ancho de banda ±1/2 octava alrededor de f_tin. Detener si produce molestia.

## Carpeta
- `webapp/` PWA con barrido para estimar f_tin y aplicar notch en tiempo real.
- `firmware/` demo I²S con notch a f_tin.
