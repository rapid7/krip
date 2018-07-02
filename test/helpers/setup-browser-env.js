// external dependencies
import browserEnv from 'browser-env';
import webcrypto from '@trust/webcrypto';
import {
  TextDecoder,
  TextEncoder
} from 'util';

browserEnv();

window.crypto = webcrypto;
window.Promise = global.Promise;

global.TextDecoder = window.TextDecoder = TextDecoder;
global.TextEncoder = window.TextEncoder = TextEncoder;
