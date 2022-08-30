import { Port, rough, LitElement, html, css, live } from './modules.bundle.js';

function title(string) {
    return string.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase())
}

class USBCommunicator extends LitElement {
  static get properties() {
    return {
      connected: { type: Boolean },
      value: { type: String },
    }
  }
  constructor() {
    super();
    this.connected = false;
    this.value = "";
    this.interfaceNumber = 0;
    this.endpointIn = 0;
    this.endpointOut = 0;
  }
  poll(interval) {
      setTimeout(() => {
          this.connected && this.send(`${this.value}\r\n`);
          this.poll(interval);
      }, interval);
  }
  connectedCallback() {
    super.connectedCallback();
    this.usb = navigator.usb;
    this.usb.getDevices().then(devices => {
      if (devices.length) {
          this.device = devices[0]
          this.connect(this.device);
      }
    });
    this.usb.onconnect = this.connected;
  }
  send(message) {
    this.device.transferOut(this.endpointOut, new TextEncoder('utf-8').encode(message))
      .then(result => console.log('sent', message, result))
      .catch(error => console.log(error))
  }
  connect() {
    let readLoop = () => this.device.transferIn(this.endpointIn, 64)
      .then(result => {
        this.receive(result);
        readLoop();
      }, console.error);
    return this.device.open()
    .then(() => this.device.configuration || this.device.selectConfiguration(1))
    .then(() => this.device.configuration.interfaces.map(element => {
        this.interfaceNumber = element.interfaceNumber;
        return element.alternatives
            .filter(alt => alt.interfaceClass == 0xFF)
            .map(alt => alt.endpoints.map(ep => this[`endpoint${title(endpoint.direction)}`] = ep.endpointNumber))
    })
    .then(() => this.device.claimInterface(this.interfaceNumber))
    .then(() => this.device.selectAlternateInterface(this.interfaceNumber, 0))
    .then(() => this.device.controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: 0x22,
        value: 0x01,
        index: this.interfaceNumber
     }))
    .then(readLoop)
    .then(() => this.onconnect)
  }
  onconnect() {
      this.connected = true;
      let event = new CustomEvent('connected', {
          detail: {
                message: 'the onconnect event was called'
              }
          });
      this.dispatchEvent(event);
  }
  disconnect() {
    return this.device.controlTransferOut({
        'requestType': 'class',
        'recipient': 'interface',
        'request': 0x22,
        'value': 0x00,
        'index': this.interfaceNumber})
    .then(() => this.device.close())
    .then(() => this.ondisconnect)
    .catch(console.error);
  }
  ondisconnect() {
      this.connected = false;
      let event = new CustomEvent('disconnect', {
          detail: {
                message: 'the ondisconnect event was called'
              }
          });
      this.dispatchEvent(event);
  }
  receive(result) {
    let textDecoder = new TextDecoder();
    let decoded = textDecoder.decode(result.data);
    console.log('received data', result, decoded);
    return decoded
  }
  toggle() {
    if (this.connected) { this.disconnect()
    } else {
      navigator.usb.requestDevice({ filters: [
        { vendorId: 0x239A }, // Adafruit boards
        { vendorId: 0xcafe }, // TinyUSB example
      ] })
      .then(selected => {
          console.log('toggle', selected);
          this.device = selected
      })
      .then(() => this.connect(this.device))
      .catch(console.error);
    }
  }
  firstUpdated() {
      this.poll(1000);
  }
  static get styles() {
    return css`
      label {
        display: block;
        font-size: larger;
      }
      .large {
        font-size: xx-large;
      }
    `;
  }
  submit(e) {
      this.value = this.renderRoot?.getElementById('message').value;
  }
  render() {
    return html`
      <div id="container">
      <wired-button @click=${this.toggle}>${this.connected ? "Disconnect" : "Connect"}</wired-button>
      <slot></slot>
      <p>${this.value}</p>
      <input id="message" type="text" .value=${this.value}>
      <input type="submit" @click=${this.submit}>
      </div>
    `;
  }
}
customElements.define('usb-communicator', USBCommunicator);
