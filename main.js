
(function () {
  "use strict";

  const App = (window.App = window.App || {});

  const state = (App.state = { items: [], query: "", sort: "added", editingId: null });
  let counter = 0;

  const comparators = {
    added: function () { return 0; }, 
    name: function (a, b) { return a.name.localeCompare(b.name, "uk"); },
    "price-asc": function (a, b) { return a.price - b.price; },
    "price-desc": function (a, b) { return b.price - a.price; },
    "total-desc": function (a, b) { return b.price * b.qty - a.price * a.qty; }
  };

  const round2 = function (n) { return Math.round(n * 100) / 100; };
  const sum = function (acc, row) { return acc + row.total; };


  function visibleRows() {
    const query = state.query.trim().toLocaleLowerCase("uk");
    const filtered = state.items.filter(function (item) {
      return item.name.toLocaleLowerCase("uk").includes(query);
    });
    const sorted = filtered.slice().sort(comparators[state.sort] || comparators.added);
    return sorted.map(function (item) {
      return { item: item, total: round2(item.price * item.qty) };
    });
  }

  function stats(rows) {
    const all = state.items.map(function (item) { return { item: item, total: round2(item.price * item.qty) }; });
    const selected = all.filter(function (row) { return row.item.selected; });
    return {
      count: state.items.length,
      shown: rows.length,
      total: round2(all.reduce(sum, 0)),
      filtered: round2(rows.reduce(sum, 0)),
      selectedCount: selected.length,
      selectedTotal: round2(selected.reduce(sum, 0))
    };
  }

  function refresh() {
    const rows = visibleRows();
    const emptyText = state.items.length === 0
      ? "Каталог порожній. Додайте першу позицію за допомогою форми вище."
      : "За вашим запитом нічого не знайдено.";
    App.render.list(document.getElementById("list"), rows, state.editingId, emptyText);
    App.render.summary(stats(rows));
  }

  function persist() {
    App.storage.save(state);
  }

  function commit() {
    persist();
    refresh();
  }

  App.model = {
    add: function (values) {
      counter += 1;
      const item = {
        id: "p" + Date.now().toString(36) + counter,
        name: values.name,
        price: round2(values.price),
        qty: values.qty,
        selected: false
      };
      state.items.push(item);
      commit();
      return item;
    },
    update: function (id, values) {
      const item = state.items.find(function (it) { return it.id === id; });
      if (item) {
        item.name = values.name;
        item.price = round2(values.price);
        item.qty = values.qty;
      }
      state.editingId = null;
      commit();
    },
    remove: function (id) {
      state.items = state.items.filter(function (it) { return it.id !== id; });
      if (state.editingId === id) state.editingId = null;
      commit();
    },
    toggle: function (id) {
      const item = state.items.find(function (it) { return it.id === id; });
      if (item) item.selected = !item.selected;
      commit();
    },
    startEdit: function (id) { state.editingId = id; refresh(); },
    cancelEdit: function () { state.editingId = null; refresh(); },
    setQuery: function (query) { state.query = query; refresh(); },
    setSort: function (sort) { state.sort = sort; commit(); },
    clearAll: function () {
      App.storage.clear();
      state.items = [];
      state.query = "";
      state.sort = "added";
      state.editingId = null;
      refresh();
    }
  };

  function init() {
    const saved = App.storage.load();
    state.items = saved.items;
    state.sort = Object.prototype.hasOwnProperty.call(comparators, saved.sort) ? saved.sort : "added";
    document.getElementById("sort").value = state.sort;
    App.events.bind();
    refresh();
    if (saved.corrupted) App.render.status("Збережені дані було пошкоджено, сховище скинуто.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
