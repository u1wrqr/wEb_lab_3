
(function () {
  "use strict";

  function customFind(array, predicate, thisArg) {
    if (!Array.isArray(array)) throw new TypeError("customFind: перший аргумент має бути масивом");
    if (typeof predicate !== "function") throw new TypeError("customFind: predicate має бути функцією");

   
    for (let i = 0; i < array.length; i += 1) {
      const value = array[i];
      if (predicate.call(thisArg, value, i, array)) return value;
    }
    return undefined;
  }


  const input = Lab.deepFreeze([
    { id: 1, name: "Клавіатура" },
    { id: 2, name: "Миша" },
    { id: 3, name: "Монітор" }
  ]);
  const byId2 = function (item) { return item.id === 2; };


  const expected = input.find(byId2);
  const actual = customFind(input, byId2);


  Lab.check(actual === expected, "find: знайдено той самий елемент, що й у вбудованого методу");
  Lab.check(actual === input[1], "find: повертається посилання на елемент, а не копія");
  Lab.check(customFind(input, function (item) { return item.id === 99; }) === undefined, "find: не знайдено — undefined");
  Lab.check(customFind([], function () { return true; }) === undefined, "find: порожній масив — undefined");

  let calls = 0;
  customFind([1, 2, 3, 4], function (x) { calls += 1; return x === 2; });
  Lab.check(calls === 2, "find: пошук зупиняється на першому збігу");

  Lab.check(customFind([5, 6, 7, 8], function (x) { return x > 5; }) === 6, "find: повертається перший із кількох збігів");

  let sparseCalls = 0;
  const builtInCalls = (function () {
    let n = 0;
    [, , 3].find(function (x) { n += 1; return x === 3; }); 
    return n;
  })();
  customFind([, , 3], function (x) { sparseCalls += 1; return x === 3; }); 
  Lab.check(sparseCalls === builtInCalls, "find: пропуски відвідуються так само, як у вбудованого методу");

  const ctx = { limit: 2 };
  Lab.check(customFind([1, 2, 3], function (x) { return x > this.limit; }, ctx) === 3, "find: thisArg передається в predicate");

  Lab.check(customFind([0, false, ""], function (x) { return x === 0; }) === 0, "find: знайдене хибне значення повертається коректно");

  let thrown = false;
  try { customFind([1], undefined); } catch (e) { thrown = e instanceof TypeError; }
  Lab.check(thrown, "find: не функція в predicate дає TypeError");

  Lab.check(input.length === 3 && input[0].name === "Клавіатура", "find: вхідні дані не змінено");

  Lab.done("find");
})();
