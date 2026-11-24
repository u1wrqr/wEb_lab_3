
(function () {
  "use strict";

  function build(table, rowsOn, rowsOff, label) {
    const head = document.createElement("tr");
    ["Ситуація", "Без директиви", "Зі строгим режимом"].forEach(function (text) {
      const th = document.createElement("th");
      th.className = "table__cell table__cell--head";
      th.scope = "col";
      th.textContent = text;
      head.append(th);
    });
    table.append(head);

    rowsOn.forEach(function (on) {
      const off = rowsOff.find(function (row) { return row.id === on.id; });
      const tr = document.createElement("tr");
      [on.title, off ? off.value : "—", on.value].forEach(function (text) {
        const td = document.createElement("td");
        td.className = "table__cell";
        td.textContent = text;
        tr.append(td);
      });
      table.append(tr);
      console.log(label + " | " + on.title + " | без директиви → " + (off ? off.value : "—") + " | strict → " + on.value);
    });
  }

  const lab = window.StrictLab;
  if (!lab || !lab.on || !lab.off) {
    console.error("strict-view: не знайдено результатів strict-on.js / strict-off.js");
    return;
  }
  build(document.getElementById("runtime-table"), lab.on.runtime, lab.off.runtime, "виконання");
  build(document.getElementById("parse-table"), lab.on.parse, lab.off.parse, "розбір");
})();
