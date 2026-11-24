
(function () {
  "use strict";

  function deepClone(value, seen = new WeakMap()) {
    if (value === null || typeof value !== "object") return value; 
    if (seen.has(value)) return seen.get(value); 

    if (value instanceof Date) return new Date(value.getTime());
    if (value instanceof RegExp) return new RegExp(value.source, value.flags);

    if (value instanceof Map) {
      const map = new Map();
      seen.set(value, map);
      value.forEach(function (v, k) { map.set(deepClone(k, seen), deepClone(v, seen)); });
      return map;
    }
    if (value instanceof Set) {
      const set = new Set();
      seen.set(value, set);
      value.forEach(function (v) { set.add(deepClone(v, seen)); });
      return set;
    }
    if (Array.isArray(value)) {
      const arr = new Array(value.length);
      seen.set(value, arr);
      for (let i = 0; i < value.length; i += 1) {
        if (i in value) arr[i] = deepClone(value[i], seen);
      }
      return arr;
    }

    const copy = Object.create(Object.getPrototypeOf(value));
    seen.set(value, copy);
    Reflect.ownKeys(value).forEach(function (key) {
      copy[key] = deepClone(value[key], seen);
    });
    return copy;
  }

  // Вхідні дані
  const original = {
    title: "Каталог",
    tags: ["web", ["js", "dom"]],
    created: new Date(2026, 0, 15),
    stock: new Map([["a", { qty: 1 }]]),
    ids: new Set([1, 2, 3]),
    pattern: /abc/gi,
    nested: { deep: { value: 42 } },
    nothing: null
  };
  const snapshot = JSON.stringify(original);

  const viaJson = JSON.parse(JSON.stringify(original));
  const copy = deepClone(original);

  // Перевірки
  Lab.check(copy !== original && copy.nested !== original.nested, "deepClone: створено нові об’єкти на всіх рівнях");
  Lab.check(copy.nested.deep.value === 42, "deepClone: значення вкладених об’єктів збережено");

  copy.nested.deep.value = 1;
  copy.tags[1].push("events");
  Lab.check(original.nested.deep.value === 42 && original.tags[1].length === 2, "deepClone: зміна копії не впливає на оригінал");

  Lab.check(copy.created instanceof Date && copy.created !== original.created && copy.created.getTime() === original.created.getTime(), "deepClone: Date копіюється як Date");
  Lab.check(typeof viaJson.created === "string", "JSON.stringify перетворює Date на рядок (втрата типу)");

  Lab.check(copy.stock instanceof Map && copy.stock.get("a") !== original.stock.get("a") && copy.stock.get("a").qty === 1, "deepClone: Map копіюється глибоко");
  Lab.check(Object.keys(viaJson.stock).length === 0, "JSON.stringify перетворює Map на порожній об’єкт");

  Lab.check(copy.ids instanceof Set && copy.ids !== original.ids && copy.ids.size === 3 && copy.ids.has(2), "deepClone: Set копіюється");
  Lab.check(copy.pattern instanceof RegExp && copy.pattern !== original.pattern && copy.pattern.flags === "gi", "deepClone: RegExp зберігає прапорці");
  Lab.check(copy.nothing === null, "deepClone: null залишається null");

  const cyclic = { name: "loop" };
  cyclic.self = cyclic;
  const cyclicCopy = deepClone(cyclic);
  Lab.check(cyclicCopy !== cyclic && cyclicCopy.self === cyclicCopy, "deepClone: циклічні посилання зберігаються в копії");

  let jsonFailed = false;
  try { JSON.stringify(cyclic); } catch (e) { jsonFailed = e instanceof TypeError; }
  Lab.check(jsonFailed, "JSON.stringify не працює з циклічними посиланнями (TypeError)");

  class Product { constructor() { this.name = "товар"; } hello() { return "привіт"; } }
  const product = deepClone(new Product());
  Lab.check(product instanceof Product && product.hello() === "привіт", "deepClone: прототип об’єкта зберігається");

  const sym = Symbol("key");
  Lab.check(deepClone({ [sym]: 1 })[sym] === 1, "deepClone: символьні ключі копіюються");

  const fn = function () {};
  Lab.check(deepClone({ fn }).fn === fn, "deepClone: функції копіюються за посиланням");
  Lab.check(deepClone(5) === 5 && deepClone("s") === "s" && deepClone(undefined) === undefined, "deepClone: примітиви повертаються без змін");

  const shared = { v: 1 };
  const twice = deepClone({ a: shared, b: shared });
  Lab.check(twice.a === twice.b && twice.a !== shared, "deepClone: спільне посилання лишається спільним у копії");

  Lab.check(JSON.stringify(original) === snapshot, "deepClone: оригінал не змінено після всіх операцій");

  Lab.done("deepClone");
})();
