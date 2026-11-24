
(function () {
  "use strict";

  function customMap(array, callback, thisArg) {
    if (!Array.isArray(array)) throw new TypeError("customMap: перший аргумент має бути масивом");
    if (typeof callback !== "function") throw new TypeError("customMap: callback має бути функцією");

    const result = new Array(array.length);
    for (let i = 0; i < array.length; i += 1) {
      if (i in array) { 
        result[i] = callback.call(thisArg, array[i], i, array);
      }
    }
    return result;
  }

 
  const input = Lab.deepFreeze([1, 2, 3, 4]);
  const double = function (x) { return x * 2; };

 
  const expected = input.map(double);
  const actual = customMap(input, double);


  Lab.check(Lab.same(actual, expected), "map: результат збігається з Array.prototype.map");
  Lab.check(actual !== input, "map: повертається новий масив");
  Lab.check(Lab.same(input, [1, 2, 3, 4]), "map: вхідний масив не змінено");
  Lab.check(Lab.same(customMap([], double), []), "map: порожній масив дає порожній масив");

  const seen = [];
  customMap(["a", "b"], function (value, index, array) { seen.push([value, index, array.length]); });
  Lab.check(Lab.same(seen, [["a", 0, 2], ["b", 1, 2]]), "map: callback отримує (значення, індекс, масив)");

  const sparse = customMap([1, , 3], double); 
  Lab.check(sparse.length === 3 && !(1 in sparse), "map: пропуск у розрідженому масиві зберігається");

  const ctx = { factor: 10 };
  const scaled = customMap([1, 2], function (x) { return x * this.factor; }, ctx);
  Lab.check(Lab.same(scaled, [10, 20]), "map: thisArg передається в callback");

  const objects = Lab.deepFreeze([{ n: 1 }, { n: 2 }]);
  Lab.check(Lab.same(customMap(objects, function (o) { return o.n; }), [1, 2]), "map: працює з масивом об’єктів");

  let thrown = false;
  try { customMap([1], null); } catch (e) { thrown = e instanceof TypeError; }
  Lab.check(thrown, "map: не функція в callback дає TypeError");

  Lab.done("map");
})();
