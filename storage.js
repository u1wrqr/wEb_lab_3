
(function () {
  "use strict";

  const App = (window.App = window.App || {});
  const KEY = "lab03.catalog";


  function isValidItem(item) {
    return item !== null && typeof item === "object"
      && typeof item.id === "string" && item.id !== ""
      && typeof item.name === "string" && item.name.trim() !== ""
      && typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0
      && Number.isInteger(item.qty) && item.qty >= 0
      && typeof item.selected === "boolean";
  }


  function load() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch (error) {
      return { items: [], sort: "added", corrupted: false, unavailable: true };
    }
    if (raw === null) return { items: [], sort: "added", corrupted: false };

    try {
      const data = JSON.parse(raw);
      if (data === null || typeof data !== "object" || !Array.isArray(data.items)) throw new Error("невірна структура");
      return {
        items: data.items.filter(isValidItem),
        sort: typeof data.sort === "string" ? data.sort : "added",
        corrupted: false
      };
    } catch (error) {
      console.warn("storage: дані пошкоджено, сховище скинуто (" + error.message + ")");
      try { window.localStorage.removeItem(KEY); } catch (ignore) { /* сховище недоступне */ }
      return { items: [], sort: "added", corrupted: true };
    }
  }

  function save(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ items: state.items, sort: state.sort }));
      return true;
    } catch (error) {
      console.warn("storage: не вдалося зберегти (" + error.name + ")");
      return false;
    }
  }

  function clear() {
    try {
      window.localStorage.removeItem(KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  App.storage = { KEY: KEY, load: load, save: save, clear: clear };
})();
