int brightness = 30;
bool referenced = false;
int highCurrent = 0;
int lowCurrent = 0;
boolean rising = true;
bool read = false;
void setup() {
  // put your setup code here, to run once:
  pinMode(3, OUTPUT);
  Serial.begin(9600);
  attachInterrupt(digitalPinToInterrupt(3), readHighCurrent, RISING);
  analogReadResolution(12);
  analogReference(AR_EXTERNAL);
}

void readHighCurrent() {
  attachInterrupt(digitalPinToInterrupt(3), readLowCurrent, FALLING);
  highCurrent = analogRead(A0);
}
void readLowCurrent() {
  attachInterrupt(digitalPinToInterrupt(3), readHighCurrent, RISING);
  lowCurrent = analogRead(A0);
}
void readCurrent() {
  int current = analogRead(A0);
  if (rising) {
    highCurrent = current;
  } else {
    lowCurrent = current;
  }
  rising = !rising;
}

void loop() {
  if (Serial.available()) {
    brightness = Serial.parseInt();
    Serial.flush();
    read = true;
  }
  analogWrite(3, brightness);
  int current = highCurrent - lowCurrent;
  Serial.println((current*brightness)>>8);
  delay(100);
//  if (read) {
//    analogReference(referenced ? AR_EXTERNAL : AR_DEFAULT);
//    referenced = !referenced;
//    // float average = 0;
//    for (int i = 1; i <= 64; i++) {
//      int sum = 0;
//      for (int j = 0; j < 256; j++) {
//          sum += analogRead(A0);
//          delayMicroseconds(7);
//      }
//      // average += sum >> 8;
//      // Serial.println((float(sum>>8)-3255)*4.5); 
//      Serial.println(((sum>>8) - 3280)*4.5);     
//    }
//    read = false;
//  }
}
