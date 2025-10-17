# AURA — Enmascarador Adaptativo (ESP32-S3)
Dispositivo clip de bolsillo que ajusta el volumen del enmascarador según el ruido ambiente (SNR objetivo configurable).

## Hardware sugerido
- ESP32-S3 (o Sunton si quieres pantalla)
- Micrófono MEMS INMP441 (I²S)
- MAX98357A (I²S) o PCM5102A (I²S)
- Batería LiPo + TP4056

## Pines por defecto
- I²S OUT: BCLK 26, LRCLK 25, DIN 22
- I²S IN (INMP441): BCLK 26, LRCLK 25, DOUT 34 (ajusta a pin válido S3)

## Funciones
- AGC lento que mantiene el masker ≈ entorno − 10 dB (ajustable)
- Perfiles: 📚 Silencio / 🚶 Calle / 🛒 Tránsito / 🧘 Calma
- Panel web accesible + logs CSV en SD (opcional)

## Seguridad
Evitar niveles altos. Objetivo confort <65 dB. No sustituye tratamiento médico.
