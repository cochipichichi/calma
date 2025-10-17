#include <Arduino.h>
#include <driver/i2s.h>

#define MIC_BCLK 26
#define MIC_LRCK 25
#define MIC_DOUT 34
#define SAMPLE_RATE 44100
#define I2S_PORT I2S_NUM_0

float cal_k = 100.0f; // placeholder factor dBFS->dBA (calibrar)

void setup(){
  Serial.begin(115200);
  i2s_config_t cfg={.mode=(i2s_mode_t)(I2S_MODE_MASTER|I2S_MODE_RX),.sample_rate=SAMPLE_RATE,.bits_per_sample=I2S_BITS_PER_SAMPLE_32BIT,.channel_format=I2S_CHANNEL_FMT_ONLY_LEFT,.communication_format=I2S_COMM_FORMAT_STAND_MSB,.intr_alloc_flags=ESP_INTR_FLAG_LEVEL1,.dma_buf_count=6,.dma_buf_len=256,.use_apll=false,.tx_desc_auto_clear=false,.fixed_mclk=0};
  i2s_pin_config_t pins={.bck_io_num=MIC_BCLK,.ws_io_num=MIC_LRCK,.data_out_num=I2S_PIN_NO_CHANGE,.data_in_num=MIC_DOUT};
  i2s_driver_install(I2S_PORT,&cfg,0,NULL); i2s_set_pin(I2S_PORT,&pins); i2s_set_clk(I2S_PORT,SAMPLE_RATE,I2S_BITS_PER_SAMPLE_32BIT,I2S_CHANNEL_MONO);
}

void loop(){
  const size_t N=512; int32_t buf[N]; size_t br=0;
  i2s_read(I2S_PORT,buf,sizeof(buf),&br,portMAX_DELAY);
  size_t n = br/sizeof(int32_t);
  double acc=0; for(size_t i=0;i<n;i++){ float s=buf[i]/2147483648.0f; acc+=s*s; }
  float rms = sqrtf(acc/(n?n:1));
  float db_est = 20.0f*log10f(rms+1e-9f) + cal_k; // placeholder
  Serial.printf("RMS=%.6f  ~ %.1f dBA (est)\n",rms,db_est);
  delay(200);
}
