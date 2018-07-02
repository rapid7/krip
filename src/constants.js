// external dependencies
/**
 * @constant {string} ALGORITHM
 */
export const ALGORITHM = 'AES-GCM';

/**
 * @constant {string} CHARSET
 */
export const CHARSET = 'utf-8';

/**
 * @constant {boolean} IS_BROWSER
 */
export const IS_BROWSER = typeof window !== 'undefined';

/**
 * @constant {Object} GLOBAL
 */
export const GLOBAL = IS_BROWSER ? window : global;

/**
 * @constant {function} CRYPTO
 */
export const CRYPTO = GLOBAL.crypto || GLOBAL.msCrypto;

/**
 * @constant {Array<string>} CRYPTO_KEY_PROPERTIES
 */
export const CRYPTO_KEY_PROPERTIES = ['algorithm', 'extractable', 'type', 'usages'];

/**
 * @constant {function} CRYPTO_SUBTLE
 */
export const CRYPTO_SUBTLE = CRYPTO.subtle || CRYPTO.webkitSubtle;

/**
 * @constant {string} HASH_ALGORITHM
 */
export const HASH_ALGORITHM = 'SHA-256';

/**
 * @constant {number} HASH_BYTE_INCREMENT
 */
export const HASH_BYTE_INCREMENT = 4;

/**
 * @constant {number} IV_SIZE
 */
export const IV_SIZE = 12;

/**
 * @constant {number} KEY_LENGTH
 */
export const KEY_LENGTH = 256;

/**
 * @constant {number} PARSEINT_TO_HEX
 */
export const PARSEINT_TO_HEX = 16;

/**
 * @constant function} PARSER
 *
 * @param {string} string the string to parse
 * @returns {any} the parsed string value
 */
export const PARSER = (string) => {
  try {
    return JSON.parse(string);
  } catch (error) {
    return string;
  }
};

/**
 * @constant {function} STRINGIFIER
 *
 * @param {any} value the value to stringify
 * @returns {string} the stringified value
 */
export const STRINGIFIER = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return `${value}`;
  }
};

/**
 * @constant {number} STRIP_LEADING_CRYPT_HEX
 */
export const STRIP_LEADING_CRYPT_HEX = -2;

/**
 * @constant {number} STRIP_LEADING_HASH_HEX
 */
export const STRIP_LEADING_HASH_HEX = -8;

/**
 * @constant {Object} TEXT
 *
 * @property {function} Decoder the decoder to use when converting text
 * @property {function} Encoder the encoder to use when converting text
 */
export const TEXT = {
  Decoder: GLOBAL.TextDecoder,
  Encoder: GLOBAL.TextEncoder,
};

/**
 * @constant {Object} TYPED_ARRAY_TYPES
 */
export const TYPED_ARRAY_TYPES = {
  '[object Float32Array]': true,
  '[object Float64Array]': true,
  '[object Int8Array]': true,
  '[object Int16Array]': true,
  '[object Int32Array]': true,
  '[object Uint8Array]': true,
  '[object Uint8ClampedArray]': true,
  '[object Uint16Array]': true,
  '[object Uint32Array]': true,
};

/**
 * @constant {number} UNHEX_INDEX_MULTIPLIER
 */
export const UNHEX_INDEX_MULTIPLIER = 2;

/**
 * @constant {Array<string>} VALID_HASH_ALGORITHMS
 */
export const VALID_HASH_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

/**
 * @const {Object} DEFAULT_OPTIONS
 *
 * @property {string} charset the charset to use for encoding / decoding the text
 * @property {number} ivSize the size of TypedArray to use when building the iv
 * @property {number} keyLength the length of the generated key
 * @property {function} parse the method to use when parsing the stringified value upon decryption
 * @property {function} stringify the method to use when stringifying the value for encryption
 */
export const DEFAULT_OPTIONS = {
  charset: CHARSET,
  ivSize: IV_SIZE,
  keyLength: KEY_LENGTH,
  parse: PARSER,
  stringify: STRINGIFIER,
};
