
(function () {
  "use strict";

 
  function debounce(fn, wait) {
    let timerId = null;
    function debounced(...args) {
      const context = this;
      clearTimeout(timerId);
      timerId = setTimeout(function () {
        timerId = null;
        fn.apply(context, args);
      }, wait);
    }
    debounced.cancel = function () { clearTimeout(timerId); timerId = null; };
    return debounced;
  }

 
  function throttle(fn, interval) {
    let lastCall = 0;
    let timerId = null;
    let pendingArgs = null;
    let pendingContext = null;

    function run() {
      lastCall = Date.now();
      timerId = null;
      const args = pendingArgs;
      const context = pendingContext;
      pendingArgs = pendingContext = null;
      fn.apply(context, args);
    }

    function throttled(...args) {
      pendingArgs = args;
      pendingContext = this;
      const remaining = interval - (Date.now() - lastCall);
      if (remaining <= 0) {
        clearTimeout(timerId);
        run();
      } else if (timerId === null) {
        timerId = setTimeout(run, remaining);
      }
    }
    throttled.cancel = function () { clearTimeout(timerId); timerId = null; pendingArgs = pendingContext = null; };
    return throttled;
  }

  const wait = function (ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); };

  console.log("debounce/throttle: перевірки заплановано");

  (async function run() {

    let log = [];
    const search = debounce(function (text) { log.push(text); }, 60);
    ["п", "пр", "при", "прив", "приві"].forEach(function (t) { search(t); });
    Lab.check(log.length === 0, "debounce: одразу після викликів обробник ще не запущено");
    await wait(130);
    Lab.check(Lab.same(log, ["приві"]), "debounce: один виклик з останніми аргументами після паузи");

  
    log = [];
    const slow = debounce(function (x) { log.push(x); }, 60);
    for (let i = 1; i <= 4; i += 1) { slow(i); await wait(30); }
    Lab.check(log.length === 0, "debounce: поки виклики йдуть частіше за паузу, обробник не запускається");
    await wait(90);
    Lab.check(Lab.same(log, [4]), "debounce: після завершення серії виконано один виклик");

  
    log = [];
    const cancelled = debounce(function () { log.push("x"); }, 40);
    cancelled();
    cancelled.cancel();
    await wait(80);
    Lab.check(log.length === 0, "debounce: cancel скасовує запланований виклик");


    const holder = { value: 7, read: debounce(function () { log.push(this.value); }, 20) };
    holder.read();
    await wait(60);
    Lab.check(log[0] === 7, "debounce: контекст this зберігається");


    log = [];
    const scroll = throttle(function (n) { log.push(n); }, 100);
    scroll(1);
    Lab.check(Lab.same(log, [1]), "throttle: перший виклик виконується одразу");
    for (let n = 2; n <= 10; n += 1) scroll(n);
    Lab.check(log.length === 1, "throttle: у межах інтервалу додаткові виклики відкладено");
    await wait(160);
    Lab.check(Lab.same(log, [1, 10]), "throttle: по завершенні інтервалу виконано виклик з останніми аргументами");


    let calls = 0;
    const limited = throttle(function () { calls += 1; }, 100);
    const total = 12;
    for (let i = 0; i < total; i += 1) { limited(); await wait(20); }
    await wait(130);
    Lab.check(calls >= 2 && calls <= 5 && calls < total, "throttle: " + total + " подій оброблено " + calls + " викликами");


    log = [];
    const tCancel = throttle(function () { log.push("t"); }, 50);
    tCancel(); tCancel(); tCancel.cancel();
    await wait(90);
    Lab.check(log.length === 1, "throttle: cancel скасовує відкладений виклик (лишається лише перший)");

    const ctx = { n: 3, go: throttle(function () { log.push(this.n); }, 30) };
    ctx.go();
    Lab.check(log[log.length - 1] === 3, "throttle: контекст this зберігається");

    Lab.done("debounce/throttle");
  })();
})();
