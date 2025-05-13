const sum = (a, b) => a + b;

test('addition de 1 + 2 égale 3', () => {
  expect(sum(1, 2)).toBe(3);
});
