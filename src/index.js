// external dependencies
import 'webcrypto-shim';

// constants
import {
  GLOBAL,
  HASH_ALGORITHM,
  IS_BROWSER,
  TEXT,
  VALID_HASH_ALGORITHMS
} from './constants';

// utils
import {
  getNormalizedOptions,
  getCryptoHash,
  getCryptoKey,
  getHexStringForCrypt,
  getHexStringForHash,
  isPlainObject,
  rejectsAttempt,
  subtleDecrypt,
  subtleEncrypt,
  subtleGenerateKey,
  throwsProcessing
} from './utils';

if (!GLOBAL.Promise) {
  throw new ReferenceError(`Promise must be available globally.`);
}

['TextDecoder', 'TextEncoder'].forEach((requirement) => {
  if (IS_BROWSER && !GLOBAL[requirement]) {
    throw new ReferenceError(`${requirement} must be available globally.`);
  }
});

/**
 * @function decrypt
 *
 * @description
 * decrypt the encrypted value based on the key and options passed
 *
 * @param {string} encrypted the encrypted string value to decrypt
 * @param {string} secret the key to use for decryption (same as key used for encryption)
 * @param {function} [passedOptions={}] custom options used in the decryption
 * @returns {any} the decrypted value
 */
export const decrypt = (encrypted, secret, passedOptions = {}) => {
  if (!secret) {
    return rejectsAttempt('secret', 'provided');
  }

  if (passedOptions && !isPlainObject(passedOptions)) {
    return rejectsAttempt('options', 'a plain object');
  }

  const options = getNormalizedOptions(passedOptions);

  return getCryptoKey(secret, 'decrypt', options)
    .then((cryptoKey) => subtleDecrypt(cryptoKey, encrypted, options))
    .then((buffer) => new TEXT.Decoder(options.charset).decode(buffer))
    .then((text) => options.parse(text))
    .catch(throwsProcessing('decrypt'));
};

/**
 * @function encrypt
 *
 * @description
 * encrypt the value based on the key and options passed
 *
 * @param {any} value the value to encrypt
 * @param {string} secret the key to use for encryption (same as key used for decryption)
 * @param {Object} [passedOptions={}] custom options used in the encryption
 * @returns {string} the encrypted value
 */
export const encrypt = (value, secret, passedOptions = {}) => {
  if (!secret) {
    return rejectsAttempt('secret', 'provided');
  }

  if (passedOptions && !isPlainObject(passedOptions)) {
    return rejectsAttempt('options', 'a plain object');
  }

  const options = getNormalizedOptions(passedOptions);

  return getCryptoKey(secret, 'encrypt', options)
    .then((cryptoKey) => subtleEncrypt(cryptoKey, options.stringify(value), options))
    .then(({buffer, iv}) => `${getHexStringForCrypt(iv)}${getHexStringForCrypt(buffer)}`)
    .catch(throwsProcessing('encrypt'));
};

/**
 * @function generateSecret
 *
 * @description
 * generate a new crypto key based on the options passed
 *
 * @param {Object} [options={}] custom options used in the generation of the key
 * @returns {CryptoKey} the generated key
 */
export const generateSecret = (options = {}) => subtleGenerateKey(getNormalizedOptions(options));

/**
 * @function hash
 *
 * @description
 * hash the value passed based on the SHA-256 algorithm
 *
 * @param {any} value the value to hash
 * @param {string} [algorithm=HASH_ALGORITHM] the algorithm to use when hashing
 * @param {Object} [passedOptions={}] custom options used in the generation of the hash
 * @returns {string} the SHA-256 hash of the value passed
 */
export const hash = (value, algorithm = HASH_ALGORITHM, passedOptions = {}) => {
  const options = getNormalizedOptions(passedOptions);

  if (!~VALID_HASH_ALGORITHMS.indexOf(algorithm.toUpperCase())) {
    return rejectsAttempt('algorithm', `one of "${VALID_HASH_ALGORITHMS.join('", "')}"`);
  }

  if (passedOptions && !isPlainObject(passedOptions)) {
    return rejectsAttempt('options', 'a plain object', 'processing');
  }

  return getCryptoHash(value, algorithm, options)
    .then((buffer) => getHexStringForHash(buffer, options))
    .catch(throwsProcessing('hash'));
};
