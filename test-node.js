const krip = require('./node');

const KEY = {some: 'key'};

const test = async (value) => {
  const encrypted = await krip.encrypt(value, KEY);

  console.log(encrypted);

  const decrypted = await krip.decrypt(encrypted, KEY);

  console.log(decrypted);

  const key = await krip.generateSecret();

  console.log(key);

  const hashed = await krip.hash('foo', 'SHA-1');

  console.log(hashed);
};

test({some: 'data'});
