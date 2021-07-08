import { Port, rough, LitElement, html, css } from './modules.bundle.js';

class LightController extends LitElement {
  static get properties() {
    return {
      connected: { type: Boolean },
      brightness: { type: Number },
    }
  }
  constructor() {
    super();
    this.connected = false;
    this.brightness = 0;
  }
  async request() {
    return new Port(await navigator.usb.requestDevice({ filters: [
      { vendorId: 0x239A }, // Adafruit boards
      { vendorId: 0xcafe }, // TinyUSB example
    ] }));
  }
  poll(interval) {
      setTimeout(() => {
          this.port && this.send(`${this.id}${this.brightness.toString().length + 4}${this.brightness}\r\n`);
          this.poll(interval);
      }, interval);
  }
  connectedCallback() {
    super.connectedCallback();
    console.log('Starting', event);
    navigator.usb.getDevices()
      .then(devices => devices.map(device => new Port(device)))
      .then(ports => {
        if (ports.length) {
          this.port = ports[0];
        } else console.log("no ports");
      });
  }
  send(message) {
      this.port.send(message);
  }
  connect(port) {
    console.log("Connecting to Port: ", port, this);
    let receive = this.receive;
    port.connect().then(() => {
      console.log("Connected to port: ", port)
      port.onReceive = this.receive(this);
      port.onReceiveError = console.error;
    }, console.error);
  }
  disconnect(port) {
    console.log("Disconnecting from Port: ", port);
    port.disconnect();
  }
  receive(element) {
    console.log('received', { element });
    return data => {
      let textDecoder = new TextDecoder();
      let decoded = textDecoder.decode(data);
      console.log('received data', decoded);
      return decoded
    }
  }
  updateBrightness(event) {
      console.log('updateBrightness', event.detail.value, this.brightness);
      this.brightness = event.detail.value;
  }
  toggle() {
    if (this.connected) {
      this.disconnect(this.port)
      this.connected = false;
    } else {
      this.request()
      .then(selected => (this.port = selected))
      .then(() => this.connect(this.port))
      .catch(console.error);
    }
  }
  firstUpdated() {
      this.poll(1000);
  }
  reset() {
      this.brightness = 0;
  }
  static get styles() {
    return css`
      svg {
        display: block;
        margin: auto;
      }
      label {
        display: block;
        font-size: larger;    
      }
      wired-slider {
        display: block;
        margin: auto;
      }
      .large {
        font-size: xx-large;
      }
    `;
  }
  render() {
    return html`
      <style>
      </style>
      <wired-button @click=${this.reset}>Reset</wired-button>
      <wired-button @click=${this.toggle}>${this.connected ? "Disconnect" : "Connect"}</wired-button>
      <label for="size">Brightness
        <wired-slider id="brightness" step="1" knobradius="15" value=${this.brightness} @change=${this.updateBrightness} min="0" max="100"></wired-slider>
      </label>
    `;
  }
}
customElements.define('light-controller', LightController);
