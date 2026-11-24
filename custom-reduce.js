
(function () {
  "use strict";

  function customReduce(array, callback, initialValue) {
    if (!Array.isArray(array)) throw new TypeError("customReduce: перший аргумент має бути масивом");
    if (typeof callback !== "function") throw new TypeError("customReduce: callback має бути функцією");

    const hasInitial = arguments.length >= 3;
    let index = 0;
    let accumulator;

    if (hasInitial) {
      accumulator = initialValue;
    } else {
      while (index < array.length && !(index in array)) index += 1; 
      if (index >= array.length) throw new TypeError("customReduce: порожній масив без початкового значення");
      accumulator = array[index];
      index += 1;
    }

    for (; index < array.length; index += 1) {
      if (index in array) {
        accumulator = callback(accumulator, array[index], index, array);
      }
    }
    return accumulator;
  }


  const input = Lab.deepFreeze([1, 2, 3, 4, 5]);
  const add = function (acc, x) { return acc + x; };


  const expected = input.reduce(add, 0);
  const actual = customReduce(input, add, 0);

  Lab.check(actual === expected, "reduce: сума з початковим значенням збігається з вбудованою");
  Lab.check(customReduce(input, add) === input.reduce(add), "reduce: без початкового значення береться перший елемент");
  Lab.check(customReduce([], add, 100) === 100, "reduce: порожній масив з початковим значенням повертає його");
  Lab.check(customReduce([7], add) === 7, "reduce: один елемент без початкового значення повертається як є");

  let called = 0;
  customReduce([7], function () { called += 1; });
  Lab.check(called === 0, "reduce: для одного елемента callback не викликається");

  let thrown = false;
  try { customReduce([], add); } catch (e) { thrown = e instanceof TypeError; }
  Lab.check(thrown, "reduce: порожній масив без початкового значення дає TypeError");

  const firstIndex = [];
  customReduce([10, 20, 30], function (acc, x, i) { firstIndex.push(i); return acc; });
  Lab.check(Lab.same(firstIndex, [1, 2]), "reduce: без початкового значення індексація починається з 1");

  const words = ["яблуко", "груша", "ківі"];
  const lengths = customReduce(words, function (acc, w) { acc[w] = w.length; return acc; }, {});
  Lab.check(Lab.same(lengths, { "яблуко": 6, "груша": 5, "ківі": 4 }), "reduce: збирання об’єкта з масиву");

  const nested = customReduce([[1, 2], [3], [4, 5]], function (acc, part) { return acc.concat(part); }, []);
  Lab.check(Lab.same(nested, [1, 2, 3, 4, 5]), "reduce: об’єднання вкладених масивів");

  Lab.check(Lab.same(input, [1, 2, 3, 4, 5]), "reduce: вхідний масив не змінено");

  Lab.done("reduce");
})();
