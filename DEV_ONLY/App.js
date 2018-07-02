// polyfills
import './polyfill';

// external dependencies
import {deepEqual} from 'fast-equals';

// src
import * as src from '../src';
// import * as src from '../index';

const KEY = 'SOME_STATIC_KEY'; // static string
// const KEY = {
//   some: 'object',
//   to: 'stringify',
// }; // static object
// const KEY = Date.now(); // dynamic value

const map = new Map();

map.set({foo: 'bar'}, 'baz');

const VALUES = {
  array: ['foo', 123, {bar: 'baz'}],
  arrayBuffer: new ArrayBuffer(36),
  long: `Lorem ipsum dolor amet viral lomo celiac kale chips gentrify dreamcatcher shoreditch austin offal before they sold out keffiyeh tbh put a bird on it. Synth franzen echo park truffaut 90's sriracha offal yr adaptogen banjo venmo hella. Everyday carry sustainable bicycle rights, kickstarter craft beer fingerstache pitchfork twee shabby chic salvia offal ramps quinoa. Narwhal kickstarter flannel vice lo-fi, live-edge kitsch raclette schlitz portland hot chicken kombucha yuccie YOLO. Irony put a bird on it actually cloud bread cardigan tbh, freegan poke unicorn adaptogen man braid cold-pressed shabby chic ethical. Aesthetic single-origin coffee messenger bag tousled craft beer palo santo food truck listicle.

  Squid try-hard umami adaptogen flexitarian. Edison bulb whatever copper mug cloud bread synth schlitz raclette distillery la croix pop-up lumbersexual mlkshk gastropub pickled kogi. Gluten-free DIY try-hard beard, put a bird on it food truck microdosing photo booth poke keytar tattooed authentic. Biodiesel fixie wolf leggings synth, meggings vaporware. Cardigan gochujang schlitz umami normcore tote bag ethical ugh gentrify chartreuse locavore mlkshk literally. Pug cred lo-fi authentic, put a bird on it street art etsy direct trade chicharrones actually. Before they sold out crucifix tote bag chia.

  Mumblecore iceland glossier viral meggings, farm-to-tatextble enamel pin. Seitan scenester pickled master cleanse heirloom, taiyaki food truck PBR&B narwhal cliche tilde jianbing vexillologist art party. Next level forage four dollar toast seitan pabst marfa chillwave fashion axe banh mi jianbing. Chia vaporware narwhal pickled echo park blue bottle scenester lyft small batch ethical street art locavore. Hexagon franzen food truck cred put a bird on it kale chips schlitz gochujang viral four dollar toast before they sold out polaroid taxidermy chia. Disrupt lumbersexual letterpress celiac, glossier subway tile listicle kogi echo park sriracha direct trade. Raclette 8-bit kombucha, +1 hashtag microdosing messenger bag tumblr kickstarter palo santo disrupt.

  Cloud bread locavore austin offal. Leggings shoreditch bespoke yr lomo williamsburg. Godard chambray direct trade cloud bread. Deep v flexitarian kickstarter pug raw denim chambray twee prism williamsburg glossier forage.

  Kale chips truffaut roof party schlitz, ramps YOLO meditation tumeric iPhone ethical. Church-key cred forage crucifix, pug hexagon selfies paleo celiac organic put a bird on it ethical woke gluten-free. Cardigan bespoke art party, leggings iceland chillwave truffaut forage swag PBR&B chia green juice fixie gastropub sartorial. Disrupt seitan chillwave pour-over, actually fanny pack XOXO listicle before they sold out wolf brunch pickled tote bag. Irony flannel trust fund fam, artisan neutra jianbing chicharrones cliche pabst williamsburg portland.`,
  map,
  nil: null,
  number: 12345,
  object: {some: 'data'},
  short: 'my special text + foo',
  typedArray: new Uint8Array(12),
};

const parse = (string) =>
  JSON.parse(
    string,
    (key, value) =>
      Array.isArray(value) && value.every((item) => Array.isArray(item) && item.length === 2) ? new Map(value) : value
  );

const succeed = async (value, key = KEY) => {
  const encrypted = await src.encrypt(value, key);
  const decrypted = await src.decrypt(encrypted, key, {parse});

  return {
    decrypted,
    encrypted,
    isEqual: deepEqual(value, decrypted),
    original: value,
  };
};

const runSucceed = () =>
  new Promise((resolve) => {
    Object.keys(VALUES).forEach(async (key, index) => {
      const result = await succeed(VALUES[key]);

      console.log('[succeed encrypt/decrypt]', key, ':', result);

      if (index === Object.keys(VALUES).length - 1) {
        resolve();
      }
    });
  });

const fail = async (value) => {
  try {
    const encrypted = await src.encrypt(value, KEY);
    const decrypted = await src.decrypt(encrypted, 'nope', {parse});

    return {
      decrypted,
      encrypted,
      isEqual: deepEqual(value, decrypted),
      original: value,
    };
  } catch (error) {
    console.error(error);
  }
};

const runFail = () =>
  new Promise((resolve) => {
    Object.keys(VALUES).forEach(async (key, index) => {
      await fail(VALUES[key]);

      if (index === Object.keys(VALUES).length - 1) {
        resolve();
      }
    });
  });

const runGenerateSecret = () =>
  new Promise((resolve) => {
    Object.keys(VALUES).forEach(async (key, index) => {
      const encryptionKey = await src.generateSecret();
      const result = await succeed(VALUES[key], encryptionKey);

      console.log('[generated secret]', key, ':', result);

      if (index === Object.keys(VALUES).length - 1) {
        resolve();
      }
    });
  });

const runHash = () =>
  new Promise((resolve) => {
    Object.keys(VALUES).forEach(async (key, index) => {
      const result = await src.hash(VALUES[key]);

      console.log('[hash]', key, ':', result);

      if (index === Object.keys(VALUES).length - 1) {
        resolve();
      }
    });
  });

const run = async () => {
  console.group('succeed encrypt / decrypt');
  await runSucceed();
  console.groupEnd('succeed encrypt / decrypt');

  console.group('fail encrypt / decrypt');
  await runFail();
  console.groupEnd('fail encrypt / decrypt');

  console.group('generate secret');
  await runGenerateSecret();
  console.groupEnd('generate secret');

  console.group('hash');
  await runHash();
  console.groupEnd('hash');

  console.group('errors');

  try {
    const result = await src.encrypt('');

    console.log(result);
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await src.encrypt('', 'foo', 'bar');

    console.log(result);
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await src.decrypt('');

    console.log(result);
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await src.decrypt('', 'foo', 'bar');

    console.log(result);
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await src.hash('foo', 'bar');

    console.log(result);
  } catch (error) {
    console.error(error);
  }

  console.groupEnd('errors');
};

run();
