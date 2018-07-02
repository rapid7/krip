// test
import test from 'ava';

// src
import * as constants from 'src/constants';

test('if PARSER will parse a valid JSON string', (t) => {
  const object = {foo: 'bar'};
  const string = JSON.stringify(object);

  const result = constants.PARSER(string);

  t.not(result, object);
  t.deepEqual(result, object);
});

test('if PARSER will return the value passed if unable to parse', (t) => {
  const object = {foo: 'bar'};

  const result = constants.PARSER(object);

  t.is(result, object);
});

test('if STRINGIFIER will parse a valid JSON string', (t) => {
  const object = {foo: 'bar'};

  const result = constants.STRINGIFIER({foo: 'bar'});

  t.is(result, JSON.stringify(object));
});

test('if STRINGIFIER will return the value passed if unable to parse', (t) => {
  const object = {foo: 'bar'};

  object.nested = object;

  const result = constants.STRINGIFIER(object);

  t.is(result, `${object}`);
});
