// constants
import {
  ALGORITHM,
  CRYPTO,
  CRYPTO_KEY_PROPERTIES,
  CRYPTO_SUBTLE,
  DEFAULT_OPTIONS,
  HASH_ALGORITHM,
  HASH_BYTE_INCREMENT,
  PARSEINT_TO_HEX,
  STRIP_LEADING_CRYPT_HEX,
  STRIP_LEADING_HASH_HEX,
  TEXT,
  TYPED_ARRAY_TYPES,
  UNHEX_INDEX_MULTIPLIER
} from './constants';

/**
 * @function getObjectClass
 *
 * @description
 * call the native object toString on the value passed
 *
 * @param {any} value the value to get the object class of as a string
 * @returns {string} the object class
 */
export const getObjectClass = (value) => Object.prototype.toString.call(value);

/**
 * @function getTypedArray
 *
 * @description
 * get a new typed array based on the value passed
 *
 * @param {any} buffer the buffer to convert to a typed array
 * @returns {TypedArray} the typed array
 */
export const getTypedArray = (buffer) => new Uint8Array(buffer);

/**
 * @function getBufferFromHexString
 *
 * @description
 * convert the hex string into the buffer it was built from
 *
 * @param {string} hex the hex string to convert to a buffer
 * @returns {ArrayBuffer} the buffer
 */
export const getBufferFromHexString = (hex) => {
  const length = hex.length / UNHEX_INDEX_MULTIPLIER;
  const typedArray = getTypedArray(new ArrayBuffer(length));

  let hexIndex;

  for (let index = 0; index < length; index++) {
    hexIndex = index * UNHEX_INDEX_MULTIPLIER;

    typedArray[index] = parseInt(hex[hexIndex] + hex[hexIndex + 1], 16);
  }

  return typedArray.buffer;
};

/**
 * @function getHexStringForCrypt
 *
 * @description
 * build a hex string for encrypt / decrypt from a typed array
 *
 * @param {ArrayBuffer} typedArray the typedArray to convert to a hex string
 * @returns {string} the stringified buffer
 */
export const getHexStringForCrypt = (typedArray) => {
  const byteArray = Array.prototype.slice.call(typedArray.buffer ? typedArray : getTypedArray(typedArray), 0);

  let hexString = '';

  for (let index = 0; index < byteArray.length; index++) {
    hexString += `00${byteArray[index].toString(PARSEINT_TO_HEX).toUpperCase()}`.slice(STRIP_LEADING_CRYPT_HEX);
  }

  return hexString;
};

/**
 * @function getHexStringForHash
 *
 * @description
 * build a hex string for a one-way hash from a typed array
 *
 * @param {TypedArray} typedArray the typed array to get the buffer from
 * @returns {string} the hex string
 */
export const getHexStringForHash = (typedArray) => {
  const view = new DataView(typedArray.buffer);

  let hexString = '';

  for (let index = 0; index < view.byteLength; index += HASH_BYTE_INCREMENT) {
    hexString += `00000000${view.getUint32(index).toString(PARSEINT_TO_HEX)}`.slice(STRIP_LEADING_HASH_HEX);
  }

  return hexString;
};

/**
 * @function getNormalizedSecret
 *
 * @description
 * get the secret normalized
 *
 * @param {any} secret the secret to normalize
 * @param {Object} options custom options used for operations
 * @param {function} options.stringify the stringify method to use for non-string keys
 * @returns {string} the stringified secret
 */
export const getNormalizedSecret = (secret, options) =>
  typeof secret === 'string' ? secret : options.stringify(secret);

/**
 * @function getNormalizedOptions
 *
 * @description
 * get the full options object by merging the options passed with the default options
 *
 * @param {Object} options the options passed
 * @returns {Object} the options passed shallowly merged with the default options
 */
export const getNormalizedOptions = (options) => ({
  ...DEFAULT_OPTIONS,
  ...options,
});

/**
 * @function isArrayBuffer
 *
 * @description
 * is the value passed an array buffer
 *
 * @param {any} value value to test
 * @returns {boolean} is the value an array buffer
 */
export const isArrayBuffer = (value) => getObjectClass(value) === '[object ArrayBuffer]';

/**
 * @function isCryptoKey
 *
 * @description
 * is the value passed a CryptoKey
 *
 * @param {any} value value to test
 * @returns {boolean} is the value an already-built crypto key
 */
export const isCryptoKey = (value) => {
  if (getObjectClass(value) === '[object CryptoKey]') {
    return true;
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  for (let index = 0; index < CRYPTO_KEY_PROPERTIES.length; index++) {
    // eslint-disable-next-line max-depth
    if (!Object.prototype.hasOwnProperty.call(value, CRYPTO_KEY_PROPERTIES[index])) {
      return false;
    }
  }

  return true;
};
/**
 * @function isPlainObject
 *
 * @description
 * is the value passed a plain object
 *
 * @param {any} value value to test
 * @returns {boolean} is the value a plain object
 */
export const isPlainObject = (value) => !!value && getObjectClass(value) === '[object Object]';

/**
 * @function isTypedArray
 *
 * @description
 * is the value passed a typed array
 *
 * @param {any} value value to test
 * @returns {boolean} is the value a typed array
 */
export const isTypedArray = (value) => !!TYPED_ARRAY_TYPES[getObjectClass(value)];

/**
 * @function subtleDecrypt
 *
 * @description
 * decrypt the string based on the crypto key used
 *
 * @param {string} cryptoKey the key the encryption is based on
 * @param {strin} encrypted the encrypted getHexStringForCrypt string
 * @param {Object} options custom options used for operations
 * @param {number} options.ivSize the size of TypedArray to use for building the iv
 * @returns {string} the decrypted string
 */
export const subtleDecrypt = (cryptoKey, encrypted, options) => {
  const ivHex = encrypted.slice(0, options.ivSize * UNHEX_INDEX_MULTIPLIER);
  const textHex = encrypted.slice(options.ivSize * UNHEX_INDEX_MULTIPLIER);

  return CRYPTO_SUBTLE.decrypt(
    {
      iv: getTypedArray(getBufferFromHexString(ivHex)),
      name: ALGORITHM,
      tagLength: 128,
    },
    cryptoKey,
    getBufferFromHexString(textHex)
  );
};

/**
 * @function subtleDigest
 *
 * @description
 * run the crypto digest method for the encoded key
 *
 * @param {string} encodedKey the key to digest
 * @param {string} algorithm the algorithm to digest the key with
 * @returns {CryptoKey} the crypto key object
 */
export const subtleDigest = (encodedKey, algorithm) =>
  CRYPTO_SUBTLE.digest({name: algorithm.toUpperCase()}, encodedKey);

/**
 * @function subtleEncrypt
 *
 * @description
 * encrypt the text based on the key passed
 *
 * @param {CryptoKey} cryptoKey the crypto key object
 * @param {string} text the text to encrypt
 * @param {Object} options custom options used for operations
 * @param {string} options.charset the charset to use when encoding the text
 * @param {number} options.ivSize the size of TypedArray to use for building the iv
 * @returns {Promise} promise resolving to the buffer and the iv of the text
 */
export const subtleEncrypt = (cryptoKey, text, options) => {
  const iv = CRYPTO.getRandomValues(getTypedArray(options.ivSize));

  return CRYPTO_SUBTLE.encrypt(
    {
      iv,
      name: ALGORITHM,
      tagLength: 128,
    },
    cryptoKey,
    new TEXT.Encoder(options.charset).encode(text)
  ).then((buffer) => ({
    buffer,
    iv,
  }));
};

/**
 * @function subtleGenerateKey
 *
 * @description
 * generate a new CryptoKey
 *
 * @param {Object} options custom options used for operations
 * @param {number} options.keyLength the length of the key to generate
 * @returns {CryptoKey} a custom crypto key
 */
export const subtleGenerateKey = (options) =>
  CRYPTO_SUBTLE.generateKey(
    {
      length: options.keyLength,
      name: ALGORITHM,
    },
    false,
    ['decrypt', 'encrypt']
  );

/**
 * @function subtleImportKey
 *
 * @description
 * run the crypto importKey method based on the hash and type passed
 *
 * @param {ArrayBuffer} hash the digested hash from the key digestion
 * @param {string} type the type ot crypto process to allow
 * @returns {Promise} promise resolving to the key
 */
export const subtleImportKey = (hash, type) => CRYPTO_SUBTLE.importKey('raw', hash, ALGORITHM, false, [type]);

/**
 * @function getCryptoHash
 *
 * @description
 * get the hash used for crypto keys
 *
 * @param {any} secret the secret to to base the hash on
 * @param {string} algorithm the hash algorithm to use in the key digestion
 * @param {Object} options custom options used for operations
 * @param {string} options.charset the charset to use when encoding the text
 * @returns {Promise} promise resolving to the hash
 */
export const getCryptoHash = (secret, algorithm, options) =>
  Promise.resolve(
    isTypedArray(secret)
      ? secret
      : isArrayBuffer(secret)
        ? getTypedArray(secret)
        : new TEXT.Encoder(options.charset).encode(getNormalizedSecret(secret, options))
  )
    .then((encodedKey) => subtleDigest(encodedKey, algorithm))
    .then(getTypedArray);

/**
 * @function getCryptoKey
 *
 * @description
 * get the CryptoKey object to use for encryption / decrytion
 *
 * @param {string} secret the secret to base the encryption / decryption on
 * @param {string} type the type ot crypto process to allow
 * @param {Object} options custom options used for operations
 * @param {string} options.charset the charset to use when encoding the text
 * @returns {Promise} promise resolving to the crypto key
 */
export const getCryptoKey = (secret, type, options) =>
  isCryptoKey(secret)
    ? Promise.resolve(secret)
    : getCryptoHash(secret, HASH_ALGORITHM, options).then((hash) => subtleImportKey(hash, type));

/**
 * @function throws
 *
 * @description
 * throws a string as an error to prevent having a stack trace, but still
 * say which operation failed
 *
 * @throws
 *
 * @param {string} value the value the action is taken upon
 * @param {string} action the action taken
 * @returns {Promise} the rejected promise
 */
export const rejectsAttempt = (value, action) => Promise.reject(new ReferenceError(`The ${value} must be ${action}.`));

/**
 * @function throwsProcessing
 *
 * @description
 * throw a new error based on processing
 *
 * @param {string} type the type being processed
 * @returns {function(Error): void} the function to throw the error
 */
export const throwsProcessing = (type) => (error) => {
  throw new error.constructor(`Could not ${type} this value.`);
};
