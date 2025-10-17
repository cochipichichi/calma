# Respira+ — Biofeedback (HRV/Respiración) para Tinnitus
Entrenamiento de coherencia (≈6 respiraciones/min) con feedback visual/sonoro y registro.

## Hardware (opcional)
- ESP32 con MAX30102 (PPG) por I²C
- BLE para enviar HR, RMSSD a la web/VR

## Carpetas
- `firmware/` ESP32 emitiendo HR/RR por BLE
- `webapp/` guía respiratoria + gráfico en tiempo real + export CSV
