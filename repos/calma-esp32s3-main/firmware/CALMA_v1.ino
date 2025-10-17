/**
 * CALMA — Dispositivo Tinnitus v1 (Belén Edition)
 * Placa: ESP32-S3 SUNTON 2.8"
 * Salida: I2S -> MAX98357A / PCM5102A (comparten bus)
 *
 * Funciones:
 *  - Generador de ruido (blanco/rosa/marrón)
 *  - Notch (banda atenuada en f_tin)
 *  - UI básica por TFT + táctil (LovyanGFX) [placeholder]
 *  - Panel web accesible (WiFi AP) con endpoints JSON
 *  - Temporizador y presets
 *
 * NOTA: Ajusta pines según tu SUNTON y cableado real.
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <driver/i2s.h>

// ===== WiFi AP =====
const char* AP_SSID = "CALMA-BELEN";
const char* AP_PASS = "calma1234";
WebServer server(80);

// ===== I2S Pins (ajusta según hardware) =====
#define I2S_BCLK 26
#define I2S_LRCK 25
#define I2S_DOUT 22

// ===== I2S Config =====
#define SAMPLE_RATE 44100
#define I2S_PORT I2S_NUM_0

// ===== Estado =====
volatile float g_volume = 0.35f;         // 0.0 - 1.0
volatile uint8_t g_mode = 0;             // 0 white,1 pink,2 brown,3 notch,4 ocean
volatile float g_ftin = 8000.0f;         // Hz
volatile bool g_running = true;

// ===== Notch (biquad) =====
typedef struct { float b0,b1,b2,a1,a2; float z1,z2; } biquad_t;
biquad_t notch;
void biquad_reset(biquad_t* s){ s->z1=s->z2=0; }
void biquad_make_notch(biquad_t* s, float sr, float f0, float Q){
  float w0 = 2.0f*PI*f0/sr;
  float alpha = sinf(w0)/(2.0f*Q);
  float b0 = 1.0f;
  float b1 = -2.0f*cosf(w0);
  float b2 = 1.0f;
  float a0 = 1.0f + alpha;
  float a1 = -2.0f*cosf(w0);
  float a2 = 1.0f - alpha;
  s->b0=b0/a0; s->b1=b1/a0; s->b2=b2/a0; s->a1=a1/a0; s->a2=a2/a0;
  biquad_reset(s);
}
inline float biquad_process(biquad_t* s, float x){
  float y = s->b0*x + s->z1;
  s->z1 = s->b1*x - s->a1*y + s->z2;
  s->z2 = s->b2*x - s->a2*y;
  return y;
}

// ===== ruido rosa/marrón (filtros simples) =====
float pink_state=0, brown_state=0;
inline float white(){ return (float)rand() / (float)RAND_MAX * 2.0f - 1.0f; }
inline float pink(){ pink_state = 0.98f*pink_state + 0.02f*white(); return pink_state; }
inline float brown(){ brown_state = brown_state + 0.02f*white(); brown_state = constrain(brown_state,-1.0f,1.0f); return brown_state; }
inline float ocean(){ static float s=0; s += 0.0005f; return 0.6f*pink() + 0.4f*sinf(2*PI*0.1f*s); }

// ===== I2S Task =====
TaskHandle_t audioTaskHandle;

void audioTask(void*){
  const size_t frames = 256;
  int16_t buf[frames*2]; // stereo (duplicate mono)
  size_t bytesWritten;

  while(true){
    if(!g_running){
      vTaskDelay(10/portTICK_PERIOD_MS);
      continue;
    }

    if(g_mode==3){ biquad_make_notch(&notch, SAMPLE_RATE, g_ftin, 20.0f); } // Q=20

    for(size_t i=0;i<frames;i++){
      float s;
      switch(g_mode){
        case 0: s = white(); break;
        case 1: s = pink(); break;
        case 2: s = brown(); break;
        case 3: s = biquad_process(&notch, white()); break;
        case 4: s = ocean(); break;
        default: s = white(); break;
      }
      s *= g_volume;
      int16_t v = (int16_t)(s * 32767.0f);
      buf[2*i+0] = v;
      buf[2*i+1] = v;
    }
    i2s_write(I2S_PORT, buf, sizeof(buf), &bytesWritten, portMAX_DELAY);
  }
}

// ===== API =====
void handle_index(){
  String html = R"HTML(
<!doctype html><html lang='es'><meta charset='utf-8'/>
<title>CALMA — Panel</title>
<meta name='viewport' content='width=device-width,initial-scale=1'/>
<style>body{font-family:system-ui;background:#0b1220;color:#e8eefb;padding:20px}button,input{font-size:18px}section{margin:12px 0;padding:12px;border:1px solid #27334d;border-radius:12px;background:#111827}</style>
<h1>🎧 CALMA — Belén Edition</h1>
<section><h3>Volumen</h3><input id='v' type='range' min='0' max='100' value='35' oninput='L.innerText=this.value+"%";fetch("/api/volume",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({value:+this.value})})'><span id='L'>35%</span></section>
<section><h3>Modo</h3>
<button onclick='m("white")'>⚪ Blanco</button>
<button onclick='m("pink")'>🌸 Rosa</button>
<button onclick='m("brown")'>🟤 Marrón</button>
<button onclick='m("notch")'>🎯 Notch</button>
<button onclick='m("ocean")'>🌊 Ocean</button>
</section>
<section><h3>🎯 f_tin (Hz)</h3><input id='f' type='range' min='1000' max='12000' step='10' value='8000' oninput='F.innerText=this.value+" Hz"' onchange='fetch("/api/ftin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({hz:+this.value})})'><span id='F'>8000 Hz</span> <button onclick='fetch("/api/sweep",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"})'>🔎 Barrido</button></section>
<section><h3>⏱️ Temporizador</h3><button onclick='t(5)'>5</button> <button onclick='t(10)'>10</button> <button onclick='t(20)'>20</button> <button onclick='t(30)'>30</button></section>
<script>
function m(x){fetch("/api/mode",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:x})})}
function t(x){fetch("/api/timer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({minutes:+x})})}
</script>
)HTML";
  server.send(200,"text/html",html);
}

void handle_json(){
  if(server.method()!=HTTP_POST){ server.send(405,"text/plain","Method Not Allowed"); return; }
  String path = server.uri();
  String body = server.arg("plain");
  // simple parse
  if(path=="/api/volume"){
    float val = body.substring(body.indexOf(":")+1).toFloat()/100.0f;
    g_volume = constrain(val,0.0f,1.0f);
  } else if(path=="/api/mode"){
    if(body.indexOf("white")>0) g_mode=0;
    else if(body.indexOf("pink")>0) g_mode=1;
    else if(body.indexOf("brown")>0) g_mode=2;
    else if(body.indexOf("notch")>0) g_mode=3;
    else if(body.indexOf("ocean")>0) g_mode=4;
  } else if(path=="/api/ftin"){
    float hz = body.substring(body.indexOf(":")+1).toFloat();
    g_ftin = constrain(hz, 500.0f, 16000.0f);
  } else if(path=="/api/timer"){
    // placeholder: puedes implementar apagado automático
  } else if(path=="/api/sweep"){
    // placeholder: reproduce barrido aparte si lo deseas
  }
  server.send(200,"application/json","{\"ok\":true}");
}

void setup_i2s(){
  i2s_config_t cfg = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
    .communication_format = (i2s_comm_format_t)(I2S_COMM_FORMAT_STAND_MSB),
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 6,
    .dma_buf_len = 256,
    .use_apll = false,
    .tx_desc_auto_clear = true,
    .fixed_mclk = 0
  };
  i2s_pin_config_t pins = {
    .bck_io_num = I2S_BCLK,
    .ws_io_num = I2S_LRCK,
    .data_out_num = I2S_DOUT,
    .data_in_num = I2S_PIN_NO_CHANGE
  };
  i2s_driver_install(I2S_PORT, &cfg, 0, NULL);
  i2s_set_pin(I2S_PORT, &pins);
  i2s_set_clk(I2S_PORT, SAMPLE_RATE, I2S_BITS_PER_SAMPLE_16BIT, I2S_CHANNEL_STEREO);
}

void setup(){
  Serial.begin(115200);
  delay(300);

  // WiFi AP
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASS);
  Serial.print("AP IP: "); Serial.println(WiFi.softAPIP());

  // Web
  server.on("/", handle_index);
  server.on("/api/volume", HTTP_POST, handle_json);
  server.on("/api/mode", HTTP_POST, handle_json);
  server.on("/api/ftin", HTTP_POST, handle_json);
  server.on("/api/timer", HTTP_POST, handle_json);
  server.on("/api/sweep", HTTP_POST, handle_json);
  server.begin();

  // Audio
  setup_i2s();
  biquad_make_notch(&notch, SAMPLE_RATE, g_ftin, 20.0f);

  // Audio task
  xTaskCreatePinnedToCore(audioTask, "audioTask", 4096, NULL, 1, &audioTaskHandle, 0);
}

void loop(){
  server.handleClient();
  // TODO: UI táctil con LovyanGFX (pantalla/teclas) en futuras iteraciones
}
