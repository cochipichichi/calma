#include <Arduino.h>
#include <BLEDevice.h>
// Placeholder: lee MAX30102 y envía HR/RR vía BLE (service UUID simples)
void setup(){ Serial.begin(115200); BLEDevice::init("RespiraPlus"); /* TODO: servicio HR */ }
void loop(){ delay(1000); }
