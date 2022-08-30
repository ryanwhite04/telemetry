#include <Adafruit_NeoPixel.h>
/*
  SerialPassthrough sketch

  Some boards, like the Arduino 101, the MKR1000, Zero, or the Micro, have one
  hardware serial port attached to Digital pins 0-1, and a separate USB serial
  port attached to the IDE Serial Monitor. This means that the "serial
  passthrough" which is possible with the Arduino UNO (commonly used to interact
  with devices/shields that require configuration via serial AT commands) will
  not work by default.

  This sketch allows you to emulate the serial passthrough behaviour. Any text
  you type in the IDE Serial monitor will be written out to the serial port on
  Digital pins 0 and 1, and vice-versa.

  On the 101, MKR1000, Zero, and Micro, "Serial" refers to the USB Serial port
  attached to the Serial Monitor, and "Serial1" refers to the hardware serial
  port attached to pins 0 and 1. This sketch will emulate Serial passthrough
  using those two Serial ports on the boards mentioned above, but you can change
  these names to connect any two serial ports on a board that has multiple ports.

  created 23 May 2016
  by Erik Nyquist

  https://www.arduino.cc/en/Tutorial/BuiltInExamples/SerialPassthrough
*/

#include <Adafruit_TinyUSB.h>
Adafruit_NeoPixel pixels(1, 11, NEO_GRB + NEO_KHZ800);
Adafruit_USBD_WebUSB usb_web;
WEBUSB_URL_DEF(landingPage, 1, "focus-telemetry.netlify.app");
void setup() {
  usb_web.setLandingPage(&landingPage);
  usb_web.setLineStateCallback(line_state_callback);
  usb_web.begin();
  Serial.begin(57600);
  Serial1.begin(57600);
  while(!USBDevice.mounted()) delay(1);
  pinMode(3, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  digitalWrite(3, HIGH);
  pixels.begin();
  // pinMode(7, INPUT_PULLUP);
}

void loop() {
  pixels.clear();
  pixels.setPixelColor(0, pixels.Color(0, 0, 0));
  
  if (usb_web.available()) {
    pixels.setPixelColor(0, pixels.Color(0, 0, 150));
    pixels.show();
    digitalWrite(3, HIGH);
    usb_web.setTimeout(10);
    String message = usb_web.readStringUntil('\n');
    Serial.print(message+'\n');
    Serial1.print(message);
    while (Serial1.availableForWrite() < 349) {
      delay(1);
    }
    digitalWrite(3, LOW);
    if (!digitalRead(2)) {
      message.toUpperCase();
      relay(message);
    }
  }
  if (Serial.available()) {      // If anything comes in Serial (USB),
    pixels.setPixelColor(0, pixels.Color(150, 0, 0));
    pixels.show();
    digitalWrite(3, HIGH);
    Serial.setTimeout(10);
    String message = Serial.readStringUntil('\n');
    Serial1.print(message);
    while (Serial1.availableForWrite() < 349) {
      delay(1);
    }
    digitalWrite(3, LOW);
    if (!digitalRead(2)) {
      message.toUpperCase();
      relay(message);
    }
  }
  if (Serial1.available()) {      // If anything comes in Serial (USB),
    Serial1.setTimeout(10);
    relay(Serial1.readStringUntil('\r'));
  }
  
}

void relay(String message) {
  pixels.setPixelColor(0, pixels.Color(0, 150, 0));
  pixels.show();
  usb_web.print(message);
  Serial.println(message);
}

void line_state_callback(bool connected) { if (connected) relay("Initialized"); }
