
(function () {
  "use strict";

  function customFlat(array, depth = 1) {
    if (!Array.isArray(array)) throw new TypeError("customFlat: перший аргумент має бути масивом");

    let level = Number(depth);
    level = Number.isNaN(level) ? 0 : Math.trunc(level); 

    const result = [];
    for (let i = 0; i < array.length; i += 1) {
      if (!(i in array)) continue; 
      const item = array[i];
      if (Array.isArray(item) && level > 0) {
        const inner = customFlat(item, level - 1);
        for (let j = 0; j < inner.length; j += 1) result.push(inner[j]);
      } else {
        result.push(item);
      }
    }
    return result;
  }

  const input = Lab.deepFreeze([1, [2, [3, [4, [5]]]], 6]);

  const expected1 = input.flat();
  const actual1 = customFlat(input);

  Lab.check(Lab.same(actual1, expected1), "flat: глибина за замовчуванням (1) збігається з вбудованою");
  Lab.check(Lab.same(customFlat(input, 2), input.flat(2)), "flat: глибина 2");
  Lab.check(Lab.same(customFlat(input, Infinity), [1, 2, 3, 4, 5, 6]), "flat: Infinity розгортає все");
  Lab.check(Lab.same(customFlat(input, Infinity), input.flat(Infinity)), "flat: Infinity збігається з вбудованою");

  const zero = customFlat(input, 0);
  Lab.check(zero !== input && Lab.same(zero, input), "flat: глибина 0 дає поверхневу копію");
  Lab.check(Lab.same(customFlat(input, -3), input.flat(-3)), "flat: від’ємна глибина трактується як 0");
  Lab.check(Lab.same(customFlat([1, , [2, , 3]]), [1, 2, 3]), "flat: пропуски в розріджених масивах видаляються");  no-sparse-arrays
  Lab.check(Lab.same(customFlat(["ab", ["cd"]]), ["ab", "cd"]), "flat: рядки не розгортаються за символами");
  Lab.check(Lab.same(customFlat([]), []), "flat: порожній масив");
  Lab.check(Lab.same(customFlat([[], [[]]], Infinity), []), "flat: вкладені порожні масиви зникають");
  Lab.check(Lab.same(customFlat([{ a: [1] }, [2]]), [{ a: [1] }, 2]), "flat: об’єкти не розгортаються");
  Lab.check(Lab.same(input, [1, [2, [3, [4, [5]]]], 6]), "flat: вхідний масив не змінено");

  let thrown = false;
  try { customFlat("рядок"); } catch (e) { thrown = e instanceof TypeError; }
  Lab.check(thrown, "flat: не масив дає TypeError");

  Lab.done("flat");
})();
