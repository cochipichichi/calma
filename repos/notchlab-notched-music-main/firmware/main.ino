#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <driver/i2s.h>

#define I2S_BCLK 26
#define I2S_LRCK 25
#define I2S_DOUT 22
#define SAMPLE_RATE 44100
#define I2S_PORT I2S_NUM_0

typedef struct { float b0,b1,b2,a1,a2,z1,z2; } biquad_t;
biquad_t notch;
void biquad_reset(biquad_t* s){ s->z1=s->z2=0; }
void biquad_make_notch(biquad_t* s, float sr, float f0, float Q){
  float w0=2*PI*f0/sr, alpha=sinf(w0)/(2*Q);
  float b0=1, b1=-2*cosf(w0), b2=1;
  float a0=1+alpha, a1=-2*cosf(w0), a2=1-alpha;
  s->b0=b0/a0; s->b1=b1/a0; s->b2=b2/a0; s->a1=a1/a0; s->a2=a2/a0; s->z1=s->z2=0;
}
inline float bq(biquad_t* s,float x){ float y=s->b0*x+s->z1; s->z1=s->b1*x - s->a1*y + s->z2; s->z2=s->b2*x - s->a2*y; return y; }

volatile float g_ftin=8000, g_depth=0.7f; // mix notch
float white(){ return (float)rand()/RAND_MAX*2.f-1.f; }

void setup(){
  Serial.begin(115200);
  i2s_config_t cfg = {.mode=(i2s_mode_t)(I2S_MODE_MASTER|I2S_MODE_TX),.sample_rate=SAMPLE_RATE,.bits_per_sample=I2S_BITS_PER_SAMPLE_16BIT,.channel_format=I2S_CHANNEL_FMT_RIGHT_LEFT,.communication_format=I2S_COMM_FORMAT_STAND_MSB,.intr_alloc_flags=ESP_INTR_FLAG_LEVEL1,.dma_buf_count=6,.dma_buf_len=256,.use_apll=false,.tx_desc_auto_clear=true,.fixed_mclk=0};
  i2s_pin_config_t pins = {.bck_io_num=I2S_BCLK,.ws_io_num=I2S_LRCK,.data_out_num=I2S_DOUT,.data_in_num=I2S_PIN_NO_CHANGE};
  i2s_driver_install(I2S_PORT,&cfg,0,NULL);
  i2s_set_pin(I2S_PORT,&pins);
  i2s_set_clk(I2S_PORT,SAMPLE_RATE,I2S_BITS_PER_SAMPLE_16BIT,I2S_CHANNEL_STEREO);
  biquad_make_notch(&notch,SAMPLE_RATE,g_ftin,20.0f);
}

void loop(){
  const size_t N=256; int16_t buf[N*2]; size_t bw;
  for(size_t i=0;i<N;i++){
    float s=white();
    float y=bq(&notch,s);
    float mix = (1.0f-g_depth)*s + g_depth*y;
    int16_t v=(int16_t)(mix*3000);
    buf[2*i]=v; buf[2*i+1]=v;
  }
  i2s_write(I2S_PORT,buf,sizeof(buf),&bw,portMAX_DELAY);
}
