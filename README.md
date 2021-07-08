# Speedence

## [Arduino Setup](https://learn.adafruit.com/introducing-adafruit-itsybitsy-m4/setup)

Add to preferences > Additional Board Managers URLs: https://adafruit.github.io/arduino-board-index/package_adafruit_index.json

In Board Managers add: Adafruit SAMD Boards

Include the TinyUSB Library

## Webapp Development Setup

Install [Deno](https://deno.land/#installation)

Bundle Imports

Make sure you are in the directory for speedence

```bash
deno --unstable --importmap=importmap.json modules.js modules.bundle.js
```
