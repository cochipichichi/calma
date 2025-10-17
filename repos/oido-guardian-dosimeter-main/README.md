# Oído-Guardián — Dosímetro de Ruido (ESP32)
Wearable con MEMS mic para estimar exposición sonora diaria (Leq, tiempo > umbral) y dar avisos hápticos/LED.

## Hardware
- ESP32-S3
- INMP441 (I²S)
- Motor vibración (coin) + LED RGB
- Opcional: SD para logs

## Calibración
Necesaria con fuente conocida (ruido rosa + app SPL). Este firmware incluye **placeholders** de calibración.

## Seguridad
Educar sobre pausas auditivas y protección >85 dBA.
