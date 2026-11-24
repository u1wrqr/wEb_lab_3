
(function () {
  "use strict";

  function customFilter(array, predicate, thisArg) {
    if (!Array.isArray(array)) throw new TypeError("customFilter: перший аргумент має бути масивом");
    if (typeof predicate !== "function") throw new TypeError("customFilter: predicate має бути функцією");

    const result = [];
    for (let i = 0; i < array.length; i += 1) {
      if (i in array && predicate.call(thisArg, array[i], i, array)) {
        result.push(array[i]);
      }
    }
    return result;
  }


  const input = Lab.deepFreeze([5, 12, 8, 130, 44]);
  const bigger = function (x) { return x > 10; };


  const expected = input.filter(bigger);
  const actual = customFilter(input, bigger);


  Lab.check(Lab.same(actual, expected), "filter: результат збігається з Array.prototype.filter");
  Lab.check(Lab.same(actual, [12, 130, 44]), "filter: залишено лише елементи, що задовольняють умову");
  Lab.check(Lab.same(input, [5, 12, 8, 130, 44]), "filter: вхідний масив не змінено");
  Lab.check(Lab.same(customFilter(input, function () { return false; }), []), "filter: жоден елемент не підійшов — порожній масив");
  Lab.check(customFilter(input, function () { return true; }) !== input, "filter: навіть повний збіг повертає новий масив");
  Lab.check(Lab.same(customFilter([], bigger), []), "filter: порожній масив");

  const sparse = customFilter([1, , 3], function () { return true; }); 
  Lab.check(Lab.same(sparse, [1, 3]), "filter: пропуски в розрідженому масиві пропускаються");

  const indexes = [];
  customFilter(["a", "b", "c"], function (v, i) { indexes.push(i); return i % 2 === 0; });
  Lab.check(Lab.same(indexes, [0, 1, 2]), "filter: predicate отримує індекс");

  const ctx = { min: 3 };
  const withThis = customFilter([1, 2, 3, 4], function (x) { return x >= this.min; }, ctx);
  Lab.check(Lab.same(withThis, [3, 4]), "filter: thisArg передається в predicate");

  const truthy = customFilter([0, 1, "", "a", null, undefined, NaN, []], Boolean);
  Lab.check(truthy.length === 3, "filter: враховуються істинні та хибні значення");

  let thrown = false;
  try { customFilter([1], "не функція"); } catch (e) { thrown = e instanceof TypeError; }
  Lab.check(thrown, "filter: не функція в predicate дає TypeError");

  Lab.done("filter");
})();
