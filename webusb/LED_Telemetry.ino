void setup() {
  // put your setup code here, to run once:
  Serial.begin(57600);
  Serial1.begin(57600);

  pinMode(3, OUTPUT);
}

void loop() {
  digitalWrite(3, HIGH);
  Serial1.print("l1650\r");
  Serial.print("l1650\r");
  delay(100);  
}
void loop2() {
  // put your main code here, to run repeatedly:
    // if there's any serial available, read it:

  Serial1.print("l150\r");
  while (Serial1.available()) {
    Serial.write(Serial1.read());
  }

  digitalWrite(3, HIGH);
  while(Serial.available()) {
    Serial1.write(Serial.read());

    
  }
  digitalWrite(3, LOW);
}
