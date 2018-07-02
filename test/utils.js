/* eslint-disable no-magic-numbers */

// test
import test from 'ava';
import sinon from 'sinon';

// src
import * as utils from 'src/utils';
import * as constants from 'src/constants';

test('if getObjectClass will return the correct object class', (t) => {
  const map = new Map();

  const result = utils.getObjectClass(map);

  t.is(result, Object.prototype.toString.call(map));
});

test('if getTypedArray will return the value passed as the typedarray of that', (t) => {
  const buffer = new ArrayBuffer(12);

  const result = utils.getTypedArray(buffer);

  t.true(result instanceof Uint8Array);
  t.is(result.buffer, buffer);
});

test('if getBufferFromHexString will get the ArrayBuffer based on the hex string passed', (t) => {
  const hexString = 'EE10820AB66E4891567955E9';

  const result = utils.getBufferFromHexString(hexString);

  t.true(result instanceof ArrayBuffer);
  t.is(result.byteLength, hexString.length / 2);

  t.deepEqual(new Uint8Array(result), new Uint8Array([238, 16, 130, 10, 182, 110, 72, 145, 86, 121, 85, 233]));
});

test('if getHexStringForCrypt will get the hexString based on the TypedArray passed', (t) => {
  const typedArray = new Uint8Array([17, 4, 84, 221]);

  const result = utils.getHexStringForCrypt(typedArray);

  t.is(result, '110454DD');
});

test('if getHexStringForCrypt will get the hexString based on the ArrayBuffer passed', (t) => {
  const typedArray = new Uint8Array([17, 4, 84, 221]);

  const result = utils.getHexStringForCrypt(typedArray.buffer);

  t.is(result, '110454DD');
});

test('if getHexStringForHash will get the hexString based on the TypedArray passed', (t) => {
  const typedArray = new Uint8Array([17, 4, 84, 221]);

  const result = utils.getHexStringForHash(typedArray);

  t.is(result, '110454dd');
});

test('if getNormalizedSecret will return the secret passed if a string', (t) => {
  const secret = 'secret';
  const options = {
    stringify: sinon.stub().callsFake((value) =>
      value
        .split('')
        .reverse()
        .join('')
    ),
  };

  const result = utils.getNormalizedSecret(secret, options);

  t.true(options.stringify.notCalled);

  t.is(result, secret);
});

test('if getNormalizedSecret will return the serialized secret passed if not a string', (t) => {
  const secret = {some: 'secret'};
  const options = {
    stringify: sinon.stub().callsFake((value) =>
      value.some
        .split('')
        .reverse()
        .join('')
    ),
  };

  const result = utils.getNormalizedSecret(secret, options);

  t.true(options.stringify.calledOnce);
  t.true(options.stringify.calledWith(secret));

  t.is(result, 'terces');
});

test('if getNormalizedOptions will return the options merged into the default options as a new object', (t) => {
  const options = {
    stringify() {},
  };

  const result = utils.getNormalizedOptions(options);

  t.not(result, constants.DEFAULT_OPTIONS);
  t.not(result, options);
  t.deepEqual(result, {
    ...constants.DEFAULT_OPTIONS,
    ...options,
  });
});

test('if isArrayBuffer will test if the value passed is an ArrayBuffer', (t) => {
  const object = new Uint8Array(12);

  t.false(utils.isArrayBuffer(object));
  t.true(utils.isArrayBuffer(object.buffer));
});

test('if isCryptoKey will test if the value passed is a CryptoKey', (t) => {
  class CryptoKey {
    constructor() {
      return this;
    }

    get [Symbol.toStringTag]() {
      return 'CryptoKey';
    }
  }

  const cryptoKey = new CryptoKey();
  const object = {
    algorithm: 'AES-GCM',
    extractable: false,
    type: 'foo',
    usages: ['encrypt'],
  };

  t.true(utils.isCryptoKey(cryptoKey));
  t.true(utils.isCryptoKey(object));

  t.false(utils.isCryptoKey(null));
  t.false(utils.isCryptoKey(object.algorithm));
  t.false(utils.isCryptoKey({}));
});

test('if isPlainObject will test if the value passed is a plain object', (t) => {
  t.true(utils.isPlainObject({}));
  t.false(utils.isPlainObject(true));
  t.false(utils.isPlainObject(null));
  t.false(utils.isPlainObject(123));
  t.false(utils.isPlainObject('string'));
});

test('if isTypedArray will test if the value passed is an TypedArray', (t) => {
  const object = new Uint8Array(12);

  t.true(utils.isTypedArray(object));
  t.false(utils.isTypedArray(object.buffer));
});

test.serial('if subtleDecrypt will decrypt the crypto key', async (t) => {
  const decrypted = 'decrypted';

  const decrypt = sinon.stub(constants.CRYPTO_SUBTLE, 'decrypt').resolves(decrypted);

  const cryptoKey = 'cryptoKey';
  const ivHex = utils.getHexStringForCrypt(new Uint8Array(12));
  const textHex = utils.getHexStringForCrypt(new Uint8Array(96));
  const encryptedText = `${ivHex}+${textHex}`;
  const options = {
    ivSize: 12,
  };

  const result = await utils.subtleDecrypt(cryptoKey, encryptedText, options);

  t.true(decrypt.calledOnce);
  t.deepEqual(decrypt.args[0], [
    {
      iv: utils.getTypedArray(utils.getBufferFromHexString(ivHex)),
      name: constants.ALGORITHM,
      tagLength: 128,
    },
    cryptoKey,
    utils.getBufferFromHexString(textHex),
  ]);

  t.is(result, decrypted);

  decrypt.restore();
});

test.serial('if subtleDigest will digest the key with the algorithm passed', async (t) => {
  const encodedKey = 'encodedKey';
  const algorithm = 'algorithm';

  const digested = 'digested';

  const digest = sinon.stub(constants.CRYPTO_SUBTLE, 'digest').resolves(digested);

  const result = await utils.subtleDigest(encodedKey, algorithm);

  t.true(digest.calledOnce);
  t.deepEqual(digest.args[0], [{name: algorithm.toUpperCase()}, encodedKey]);

  digest.restore();

  t.is(result, digested);
});

test.serial('if subtleEncrypt will encrypt the crypto key', async (t) => {
  const encrypted = 'encrypted';

  const randomValues = new Uint8Array(12);

  const getRandomValues = sinon.stub(constants.CRYPTO, 'getRandomValues').returns(randomValues);
  const encrypt = sinon.stub(constants.CRYPTO_SUBTLE, 'encrypt').resolves(encrypted);

  const cryptoKey = 'cryptoKey';
  const text = 'text';
  const options = {
    charset: 'utf-8',
    ivSize: 12,
  };

  const result = await utils.subtleEncrypt(cryptoKey, text, options);

  t.true(getRandomValues.calledOnce);
  t.deepEqual(getRandomValues.args[0], [utils.getTypedArray(options.ivSize)]);

  t.true(encrypt.calledOnce);
  t.deepEqual(encrypt.args[0], [
    {
      iv: randomValues,
      name: constants.ALGORITHM,
      tagLength: 128,
    },
    cryptoKey,
    new TextEncoder(options.charset).encode(text),
  ]);

  t.deepEqual(result, {
    buffer: encrypted,
    iv: randomValues,
  });

  encrypt.restore();
});

test.serial('if subtleGenerateKey will generate the key with the length passed', async (t) => {
  const options = {
    keyLength: 128,
  };

  const generated = 'generated';

  const generateKey = sinon.stub(constants.CRYPTO_SUBTLE, 'generateKey').resolves(generated);

  const result = await utils.subtleGenerateKey(options);

  t.true(generateKey.calledOnce);
  t.deepEqual(generateKey.args[0], [
    {
      length: options.keyLength,
      name: constants.ALGORITHM,
    },
    false,
    ['decrypt', 'encrypt'],
  ]);

  generateKey.restore();

  t.is(result, generated);
});

test.serial('if subtleImportKey will import the key with the hash passed', async (t) => {
  const hash = 'hash';
  const type = 'type';

  const imported = 'imported';

  const importKey = sinon.stub(constants.CRYPTO_SUBTLE, 'importKey').resolves(imported);

  const result = await utils.subtleImportKey(hash, type);

  t.true(importKey.calledOnce);
  t.deepEqual(importKey.args[0], ['raw', hash, constants.ALGORITHM, false, [type]]);

  importKey.restore();

  t.is(result, imported);
});

test.serial('if getCryptoHash will return the has to use in crypto.subtle when the secret is a string', async (t) => {
  const secret = 'secret';
  const algorithm = 'SHA-256';
  const options = {
    charset: 'utf-8',
    stringify: JSON.stringify,
  };

  const result = await utils.getCryptoHash(secret, algorithm, options);

  const encodedKey = await utils.subtleDigest(new TextEncoder(options.charset).encode(secret), algorithm);

  t.deepEqual(result, utils.getTypedArray(encodedKey));
});

test.serial(
  'if getCryptoHash will return the has to use in crypto.subtle when the secret is an ArrayBuffer',
  async (t) => {
    const secret = new ArrayBuffer(32);
    const algorithm = 'SHA-256';
    const options = {
      charset: 'utf-8',
      stringify: JSON.stringify,
    };

    const result = await utils.getCryptoHash(secret, algorithm, options);

    const encodedKey = await utils.subtleDigest(utils.getTypedArray(secret), algorithm);

    t.deepEqual(result, utils.getTypedArray(encodedKey));
  }
);

test.serial(
  'if getCryptoHash will return the has to use in crypto.subtle when the secret is a TypedArray',
  async (t) => {
    const secret = new Uint8Array(12);
    const algorithm = 'SHA-256';
    const options = {
      charset: 'utf-8',
      stringify: JSON.stringify,
    };

    const result = await utils.getCryptoHash(secret, algorithm, options);

    const encodedKey = await utils.subtleDigest(secret, algorithm);

    t.deepEqual(result, utils.getTypedArray(encodedKey));
  }
);

test.serial('if getCryptoKey will resolve the secret passed if a CryptoKey', async (t) => {
  const type = 'encrypt';
  const options = {
    stringify: sinon.stub().callsFake(JSON.stringify),
  };
  const secret = await window.crypto.subtle.generateKey(
    {
      length: 128,
      name: 'AES-GCM',
    },
    false,
    [type]
  );

  const result = await utils.getCryptoKey(secret, type, options);

  t.is(result, secret);
});

test.serial('if getCryptoKey will generate a new key if the secret passed is not a CryptoKey', async (t) => {
  const type = 'encrypt';
  const options = {
    stringify: sinon.stub().callsFake(JSON.stringify),
  };
  const secret = 'secret';

  const result = await utils.getCryptoKey(secret, type, options);

  t.not(result, secret);

  const {algorithm, ...restOfResult} = result;

  t.deepEqual(restOfResult, {
    extractable: false,
    type: 'secret',
    usages: [type],
  });

  t.deepEqual(
    {...algorithm},
    {
      length: 256,
      name: 'AES-GCM',
    }
  );
});

test('if rejectsAttempt will return a promise rejection with the constructed message', async (t) => {
  const value = 'value';
  const action = 'action';

  try {
    await utils.rejectsAttempt(value, action);
  } catch (error) {
    t.true(error instanceof ReferenceError);
    t.is(error.message, `The ${value} must be ${action}.`);
  }
});

test('if throwsProcessing will throw an error with the specific message', (t) => {
  const type = 'type';

  const throws = utils.throwsProcessing(type);

  const parentError = new Error('boom');

  try {
    throws(parentError);
  } catch (error) {
    t.true(error instanceof parentError.constructor);
    t.is(error.message, `Could not ${type} this value.`);
  }
});
