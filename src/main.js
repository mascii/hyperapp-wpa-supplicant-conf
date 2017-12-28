import { app } from 'hyperapp';
import { state, actions, view } from './app';

window.main = app(state, actions, view, document.getElementById('main'));
