import { h } from 'hyperapp';
import PBKDF2 from 'crypto-js/pbkdf2';

const makeBlob = content => new Blob([content], { type: 'text/plain' });

const makeConfig = (items) => {
  let config = 'country=JP\n';
  config += 'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n';
  config += 'update_config=1\n';

  config += items.map((item) => {
    let network = 'network={\n';
    network += `    ssid="${item.id}"\n`;
    if (item.psk.length > 0) {
      network += `    psk=${item.psk}\n`;
    } else {
      network += '    key_mgmt=NONE\n';
    }
    network += '}';
    return network;
  }).join('\n');

  return config;
};

const makeUrlWPA = (items) => {
  if (!window.navigator.msSaveBlob) {
    const content = makeConfig(items);
    return window.URL.createObjectURL(makeBlob(content));
  }
  return '#';
};

const makeUrlSSH = () => {
  if (!window.navigator.msSaveBlob) {
    return window.URL.createObjectURL(makeBlob(''));
  }
  return '#';
};

export const state = {
  items: [],
  urlWPA: makeUrlWPA([]),
  urlSSH: makeUrlSSH(),
};

export const actions = {
  addItem: e => (state) => {
    e.preventDefault();
    const newSSID = e.target.newSSID.value;
    const newPassphrase = e.target.newPassphrase.value;

    if (newSSID.length === 0) return state;

    e.target.newSSID.value = '';
    e.target.newPassphrase.value = '';
    e.target.newSSID.focus();

    const items = state.items.concat({
      id: newSSID,
      psk: newPassphrase.length !== 0 ? PBKDF2(newPassphrase, newSSID, { keySize: 8, iterations: 4096 }).toString() : '',
    });
    const urlWPA = makeUrlWPA(items);

    return { items, urlWPA };
  },
  deleteItem: item => (state) => {
    const items = state.items;
    const index = items.indexOf(item);
    items.splice(index, 1);
    const urlWPA = makeUrlWPA(items);
    return { items, urlWPA };
  },
  downloadWPA: () => (state) => {
    if (window.navigator.msSaveBlob) {
      const fileName = 'wpa_supplicant.conf';
      const content = makeConfig(state.items);
      window.navigator.msSaveBlob(makeBlob(content), fileName);
    }
  },
  downloadSSH: () => () => {
    if (window.navigator.msSaveBlob) {
      const fileName = 'ssh.txt';
      window.navigator.msSaveBlob(makeBlob(''), fileName);
    }
  },
};

export const view = (state, actions) => {
  const items = state.items.map(item => (
    <li>
        SSID: {item.id},
        Security: <span class={(item.psk.length === 0) ? 'sec-weak' : ''}>{(item.psk.length > 0) ? 'WPA2' : 'None'}</span>
      <button onclick={() => actions.deleteItem(item)} class="button-small button-red">
        削除
      </button>
    </li>
  ));
  return (
    <div>
      <form onsubmit={actions.addItem} autocomplete="off">
        SSID: <input type="text" name="newSSID" oncreate={e => e.focus()} />
        Passphrase: <input type="password" name="newPassphrase" />
        <button type="submit">追加</button>
      </form>
      <ul>
        {items}
      </ul>
      <a
        href={state.urlWPA}
        onclick={actions.downloadWPA}
        download="wpa_supplicant.conf"
      >
        <button>wpa_supplicant.conf作成</button>
      </a>
      <a
        href={state.urlSSH}
        onclick={actions.downloadSSH}
        download="ssh.txt"
      >
        <button>ssh.txt作成</button>
      </a>
    </div>
  );
};
