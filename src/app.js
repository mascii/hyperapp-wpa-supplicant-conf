import { h } from 'hyperapp';
import PBKDF2 from 'crypto-js/pbkdf2';

export const state = {
  psk: '',
};

export const actions = {
  calculatePSK: e => (state) => {
    e.preventDefault();

    const newSSID = e.target.newSSID.value;
    const newPassphrase = e.target.newPassphrase.value;

    if (newSSID.length === 0 || newPassphrase.length === 0) return state;

    const psk = PBKDF2(newPassphrase, newSSID, { keySize: 8, iterations: 4096 }).toString();

    return { psk };
  },
  selectTextOfPSK: e => (state) => {
    if (state.psk.length > 0) {
      e.focus();
      e.setSelectionRange(0, 64);
    }
  },
};

export const view = (state, actions) => (
  <div>
    <form onsubmit={actions.calculatePSK} autocomplete="off">
      SSID: <input type="text" name="newSSID" oncreate={e => e.focus()} />
      Passphrase: <input type="password" name="newPassphrase" />
      <button type="submit">Calculate</button>
    </form>
    PSK: <input type="text" value={state.psk} onupdate={actions.selectTextOfPSK} />
  </div>
);
