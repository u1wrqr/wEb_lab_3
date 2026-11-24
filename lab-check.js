
(function () {
  "use strict";

  const Lab = (window.Lab = window.Lab || {});
  const stats = { total: 0, passed: 0, failed: [] };

  function paint() {
    const summary = document.getElementById("tasks-summary");
    if (!summary) return;
    const progress = document.getElementById("tasks-progress");
    const failures = document.getElementById("tasks-failures");
    const failedCount = stats.failed.length;

    summary.textContent = failedCount === 0
      ? "Усі перевірки пройдено: " + stats.passed + " з " + stats.total
      : "Пройдено " + stats.passed + " з " + stats.total + ", збоїв: " + failedCount;
    summary.classList.toggle("report--fail", failedCount > 0);

    if (progress) {
      progress.max = Math.max(stats.total, 1);
      progress.value = stats.passed;
    }
    if (failures) {
      failures.replaceChildren();
      stats.failed.forEach(function (text) {
        const li = document.createElement("li");
        li.textContent = text;
        failures.append(li);
      });
    }
  }

 
  Lab.check = function (condition, message) {
    stats.total += 1;
    console.assert(condition, message);
    if (condition) {
      stats.passed += 1;
    } else {
      stats.failed.push(message);
    }
    paint();
  };


  Lab.same = function (a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  };


  Lab.deepFreeze = function (value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      Object.keys(value).forEach(function (key) { Lab.deepFreeze(value[key]); });
    }
    return value;
  };

  Lab.done = function (name) {
    console.log("custom " + name + ": перевірки виконано");
  };

  Lab.stats = stats;
  paint();
})();
