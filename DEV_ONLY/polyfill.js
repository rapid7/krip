import Bluebird from 'bluebird';
import encoding from 'text-encoding';

if (!window.Promise) {
  window.Promise = Bluebird;
}

if (!window.TextDecoder) {
  window.TextDecoder = encoding.TextDecoder;
}

if (!window.TextEncoder) {
  window.TextEncoder = encoding.TextEncoder;
}
