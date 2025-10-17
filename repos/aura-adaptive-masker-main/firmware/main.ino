#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <driver/i2s.h>

// WiFi AP
const char* AP_SSID="AURA-AP";
const char* AP_PASS="aura12345";
WebServer server(80);

// I2S OUT
#define I2S_BCLK 26
#define I2S_LRCK 25
#define I2S_DOUT 22

// I2S IN (INMP441) - adjust to valid pins for your board
#define MIC_BCLK 26
#define MIC_LRCK 25
#define MIC_DOUT 34

#define SAMPLE_RATE 44100
#define I2S_PORT_OUT I2S_NUM_0
#define I2S_PORT_IN  I2S_NUM_1

volatile float g_target_offset_db = -10.0f; // masker relative to ambient
volatile float g_volume = 0.3f;
volatile uint8_t g_mode = 1; // pink default

float white(){ return (float)rand()/RAND_MAX*2.f-1.f; }
static float pink_state=0, brown_state=0;
float pink(){ pink_state = 0.98f*pink_state + 0.02f*white(); return pink_state; }
float brown(){ brown_state = constrain(brown_state + 0.02f*white(), -1.f, 1.f); return brown_state; }

// crude RMS estimation for ambient level (placeholder, calibrate with SPL ref)
float ambient_rms = 0.f;

void setup_i2s_out(){
  i2s_config_t cfg = {
    .mode=(i2s_mode_t)(I2S_MODE_MASTER|I2S_MODE_TX),
    .sample_rate=SAMPLE_RATE,
    .bits_per_sample=I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format=I2S_CHANNEL_FMT_RIGHT_LEFT,
    .communication_format=I2S_COMM_FORMAT_STAND_MSB,
    .intr_alloc_flags=ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count=6, .dma_buf_len=256,
    .use_apll=false, .tx_desc_auto_clear=true, .fixed_mclk=0
  };
  i2s_pin_config_t pins = {.bck_io_num=I2S_BCLK,.ws_io_num=I2S_LRCK,.data_out_num=I2S_DOUT,.data_in_num=I2S_PIN_NO_CHANGE};
  i2s_driver_install(I2S_PORT_OUT,&cfg,0,NULL);
  i2s_set_pin(I2S_PORT_OUT,&pins);
  i2s_set_clk(I2S_PORT_OUT,SAMPLE_RATE,I2S_BITS_PER_SAMPLE_16BIT,I2S_CHANNEL_STEREO);
}

void setup_i2s_in(){
  i2s_config_t cfg = {
    .mode=(i2s_mode_t)(I2S_MODE_MASTER|I2S_MODE_RX),
    .sample_rate=SAMPLE_RATE,
    .bits_per_sample=I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format=I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format=I2S_COMM_FORMAT_STAND_MSB,
    .intr_alloc_flags=ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count=6, .dma_buf_len=256,
    .use_apll=false, .tx_desc_auto_clear=false, .fixed_mclk=0
  };
  i2s_pin_config_t pins = {.bck_io_num=MIC_BCLK,.ws_io_num=MIC_LRCK,.data_out_num=I2S_PIN_NO_CHANGE,.data_in_num=MIC_DOUT};
  i2s_driver_install(I2S_PORT_IN,&cfg,0,NULL);
  i2s_set_pin(I2S_PORT_IN,&pins);
  i2s_set_clk(I2S_PORT_IN,SAMPLE_RATE,I2S_BITS_PER_SAMPLE_32BIT,I2S_CHANNEL_MONO);
}

TaskHandle_t audioTaskHandle;
void audioTask(void*){
  const size_t N=256;
  int16_t outbuf[N*2];
  size_t bw;
  while(true){
    // simple AGC: read mic chunk
    int32_t micbuf[N];
    size_t br=0;
    i2s_read(I2S_PORT_IN, micbuf, sizeof(micbuf), &br, portMAX_DELAY);
    size_t samples = br/sizeof(int32_t);
    double acc=0;
    for(size_t i=0;i<samples;i++){
      float s = micbuf[i]/2147483648.0f;
      acc += s*s;
    }
    float rms = sqrtf((float)(acc/(samples>0?samples:1)));
    ambient_rms = 0.9f*ambient_rms + 0.1f*rms;

    // target level (placeholder mapping): vol = k * ambient + b
    float target = ambient_rms * 0.6f; // tune
    float vol = 0.9f*g_volume + 0.1f*target;
    vol = constrain(vol, 0.05f, 0.8f);

    for(size_t i=0;i<N;i++){
      float s;
      switch(g_mode){
        case 0: s = white(); break;
        case 1: s = pink(); break;
        case 2: s = brown(); break;
        default: s = pink(); break;
      }
      s *= vol;
      int16_t v = (int16_t)(s*32767.f);
      outbuf[2*i]=v; outbuf[2*i+1]=v;
    }
    i2s_write(I2S_PORT_OUT, outbuf, sizeof(outbuf), &bw, portMAX_DELAY);
  }
}

WebServer::THandlerFunction post_handler = [](){
  String u = server.uri(), body = server.arg("plain");
  if(u=="/api/mode"){
    if(body.indexOf("white")>0) g_mode=0;
    else if(body.indexOf("pink")>0) g_mode=1;
    else if(body.indexOf("brown")>0) g_mode=2;
  }else if(u=="/api/volume"){
    float v = body.substring(body.indexOf(":")+1).toFloat()/100.f;
    g_volume = constrain(v,0.f,1.f);
  }
  server.send(200,"application/json","{\"ok\":true}");
};

void setup(){
  Serial.begin(115200);
  WiFi.mode(WIFI_AP); WiFi.softAP(AP_SSID,AP_PASS);
  server.on("/",[](){server.send(200,"text/plain","AURA running. Use /api endpoints.");});
  server.on("/api/mode",HTTP_POST,post_handler);
  server.on("/api/volume",HTTP_POST,post_handler);
  server.begin();
  setup_i2s_out();
  setup_i2s_in();
  xTaskCreatePinnedToCore(audioTask,"audioTask",4096,NULL,1,&audioTaskHandle,0);
}

void loop(){ server.handleClient(); }
