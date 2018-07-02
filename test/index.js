// test
import test from 'ava';
import nodeCrypto from 'crypto';

// src
import * as index from 'src/index';
import * as utils from 'src/utils';
import {
  IV_SIZE,
  UNHEX_INDEX_MULTIPLIER
} from 'src/constants';

const KEY = 'MY_SPECIAL_KEY';

test('if encrypt will successfully encrypt the value, and decrypt will successfully decrypt the encrypted value', async (t) => {
  const value = {
    some: 'data',
  };

  const encrypted = await index.encrypt(value, KEY);

  const ivHex = encrypted.slice(0, IV_SIZE * 2);
  const textHex = encrypted.slice(IV_SIZE * 2);

  t.true(/^[a-fA-F0-9]+$/.test(ivHex));
  t.true(/^[a-fA-F0-9]+$/.test(textHex));

  t.not(encrypted, value);
  t.notDeepEqual(encrypted, value);

  const decrypted = await index.decrypt(encrypted, KEY);

  t.not(decrypted, value);
  t.deepEqual(decrypted, value);
});

test('if decrypt will return a rejected promise if no secret is provided', async (t) => {
  const decrypted = 'decrypted';

  try {
    await index.decrypt(decrypted);

    t.fail();
  } catch (error) {
    t.pass(error);
  }
});

test('if decrypt will return a rejected promise if the options passed are not a plain object', async (t) => {
  const decrypted = 'decrypted';
  const secret = 'secret';
  const passedOptions = 'passedOptions';

  try {
    await index.decrypt(decrypted, secret, passedOptions);

    t.fail();
  } catch (error) {
    t.pass(error);
  }
});

test('if encrypt will return a rejected promise if no secret is provided', async (t) => {
  const value = 'value';

  try {
    await index.encrypt(value);

    t.fail();
  } catch (error) {
    t.pass(error);
  }
});

test('if encrypt will return a rejected promise if the options passed are not a plain object', async (t) => {
  const value = 'value';
  const secret = 'secret';
  const passedOptions = 'passedOptions';

  try {
    await index.encrypt(value, secret, passedOptions);

    t.fail();
  } catch (error) {
    t.pass(error);
  }
});

test('if generateSecret will generate a new CryptoKey', async (t) => {
  const result = await index.generateSecret();

  t.true(utils.isCryptoKey(result));

  t.is(result.algorithm.length, 256);
  t.is(result.algorithm.name, 'AES-GCM');
  t.false(result.extractable);
  t.is(result.type, 'secret');
  t.deepEqual(result.usages, ['decrypt', 'encrypt']);
});

test('if hash will generate a new hash', async (t) => {
  const value = {
    some: 'data',
  };

  const result = await index.hash(value);

  t.is(
    result,
    nodeCrypto
      .createHash('sha256')
      .update(JSON.stringify(value), 'utf8')
      .digest('hex')
  );
});

test('if hash will generate a new hash based on other types', async (t) => {
  const value = {
    some: 'data',
  };

  t.is(
    await index.hash(value, 'SHA-1'),
    nodeCrypto
      .createHash('sha1')
      .update(JSON.stringify(value), 'utf8')
      .digest('hex')
  );

  t.is(
    await index.hash(value, 'SHA-384'),
    nodeCrypto
      .createHash('sha384')
      .update(JSON.stringify(value), 'utf8')
      .digest('hex')
  );

  t.is(
    await index.hash(value, 'SHA-512'),
    nodeCrypto
      .createHash('sha512')
      .update(JSON.stringify(value), 'utf8')
      .digest('hex')
  );
});

test('if hash will return a rejected promise if an invalid algorithm is provided', async (t) => {
  const value = 'value';
  const algorithm = 'algorithm';

  try {
    await index.hash(value, algorithm);

    t.fail();
  } catch (error) {
    t.pass(error);
  }
});

test('if hash will return a rejected promise if the options passed are not a plain object', async (t) => {
  const value = 'value';
  const algorithm = 'SHA-256';
  const passedOptions = 'passedOptions';

  try {
    await index.hash(value, algorithm, passedOptions);

    t.fail();
  } catch (error) {
    t.pass(error);
  }
});
