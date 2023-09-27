import { set } from 'lodash-es';
import { describe, test } from 'vitest';
const a = [
  {
    b: {
      c: [1],
    },
  },
];
describe('json method test', () => {
  test('update method', () => {
    const res = set(a, '0.b.123', 10);
    console.log(JSON.stringify(res, null, 2));
  });
});
