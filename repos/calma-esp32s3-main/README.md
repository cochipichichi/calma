# 🎧 Proyecto CALMA — Dispositivo Tinnitus v1 (Belén Edition)

**Placa objetivo:** SUNTON ESP32-S3 2432S028 (pantalla táctil 2,8″, ILI9341 + XPT2046)  
**Salidas de audio:** I²S → MAX98357A (altavoz/diadema ósea) **y/o** I²S → PCM5102A (jack audífonos)  
**Interfaz:** Pantalla táctil **y** Panel Web accesible (Wi‑Fi AP local)

> Dedicado a Belén 💜 — hecho con cariño por Pancho Pinto.

## Carpeta y contenidos
- `firmware/CALMA_v1.ino` — Firmware ESP32-S3 (generador de ruidos: blanco/rosa/marrón + notch; control táctil + web; temporizador; presets)
- `webapp/` — Panel web accesible (HTML/CSS/JS) estilo repos de Pancho
- `docs/guia_instalacion.md` — Guía de cableado, compilación y uso
- `docs/hoja_registro_sheets.xlsx` — Plantilla de seguimiento (uso/nota diaria)
- `3d/carcasa_calma_v1.stl` — Carcasa simple (prototipo)
- `assets/icons/` — Íconos SVG

## Pines sugeridos (ajustables)
**I²S común para ambas salidas:**
- BCLK: GPIO 26
- LRCLK: GPIO 25
- DIN (SD): GPIO 22

> MAX98357A usa BCLK/LRCLK/DIN. PCM5102A también usa I²S (BCK/LRCK/DIN).  
> Puedes cablear **en paralelo** el mismo bus I²S a ambos módulos (comparten las 3 líneas), alimentándolos por separado.  
> **No** mezclar salidas analógicas entre sí (no unir salidas de altavoz y jack).

**Pantalla ILI9341 + XPT2046** (valores típicos SUNTON, ajusta si fuera necesario):
- TFT: SCK 18, MOSI 23, MISO 19, CS 15, DC 2, RST 4, BL 14  
- Touch: CS 21, IRQ 36 (para S3 usar pin con soporte táctil/INT)  
- SD (si usas): CS 5 (SPI compartido)

## Build rápido
- Board: **ESP32S3 Dev Module**
- PSRAM: Enabled
- Flash: 16MB (ajusta según placa)
- Partition: Default o "Huge APP"

## Seguridad y buen uso
- Mantén niveles cómodos: objetivo <65 dB para uso prolongado; picos <85 dB.
- Este proyecto **no** reemplaza tratamiento médico. Coordínalo con otorrino/fonoaudióloga.

¡Éxito, Pancho! 🌿
