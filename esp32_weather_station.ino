#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h> // Make sure to install ArduinoJson library via Library Manager

// Replace with your network credentials
const char* ssid = "ESP32";
const char* password = "12345678";

WebServer server(80);

// Define Sensor Pins (adjust based on your wiring)
#define SOIL_PIN 34
#define RAIN_PIN 35
#define LDR_PIN 32
// If using a DHT sensor for Temp/Humidity, you would include DHT.h and configure it here.

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.print("ESP32 IP address:10.96.116.112 ");
  Serial.println(WiFi.localIP()); // COPY THIS IP AND PASTE IN script.js

  // Handle requests to the "/data" endpoint
  server.on("/data", HTTP_GET, []() {
    // IMPORTANT: Add CORS header so your local dashboard can fetch the data
    server.sendHeader("Access-Control-Allow-Origin", "*");

    // Read Sensor Values
    // Note: Replace the static temp/humidity with actual sensor reads (e.g., dht.readTemperature())
    float temperature = random(250, 350) / 10.0; 
    float humidity = random(50, 80);
    int soil = analogRead(SOIL_PIN);
    int rain = analogRead(RAIN_PIN);
    int light = analogRead(LDR_PIN);

    // Create JSON Document
    StaticJsonDocument<200> doc;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["soil"] = soil;
    doc["rain"] = rain;
    doc["light"] = light;

    // Serialize JSON into a string
    String jsonResponse;
    serializeJson(doc, jsonResponse);

    // Send the response
    server.send(200, "application/json", jsonResponse);
  });

  // Start the server
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  // Listen for incoming clients
  server.handleClient();
}
