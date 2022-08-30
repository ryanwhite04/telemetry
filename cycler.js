import { Port, rough, LitElement, html, css } from './modules.bundle.js';

class LightCycler extends LitElement {
  static get properties() {
    return {
      cycling: { type: Boolean },
      high: { type: Boolean },
      brightness: { type: Number },
    }
  }
  constructor() {
    super();
    this.cycling = true;
    this.high = true;
    this.brightness = 99;
  }
  static get styles() {
    return css`
    `;
  }
  toggle() {
      this.cycling = !this.cycling;
      this.cycling ? this.cycle() : clearInterval(this.timer);
      console.log('toggle', this.cycling);

  }
  cycle() {
      console.log('cycle', this.timer);
      this.timer = setInterval(() => {
          this.brightness = this.high ? 0 : 99;
          this.high = !this.high;
      }, 1000);
  }
  render() {
    return html`
      <input id="cycling" type="checkbox" @click=${this.toggle} ?checked=${this.cycling}> 
      <p>Brightness: ${this.brightness}</p>
    `;
  }
}
customElements.define('light-cycler', LightCycler);
