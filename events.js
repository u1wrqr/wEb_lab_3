
(function () {
  "use strict";

  const App = (window.App = window.App || {});

  function debounce(fn, wait) {
    let timerId = null;
    return function (...args) {
      clearTimeout(timerId);
      timerId = setTimeout(function () { fn.apply(this, args); }.bind(this), wait);
    };
  }

  const MESSAGES = {
    required: "Поле обов’язкове для заповнення",
    name: "Назва має містити щонайменше 2 символи",
    badNumber: "Введіть число",
    priceMin: "Ціна має бути більшою за 0",
    priceMax: "Ціна не може перевищувати 1 000 000",
    priceStep: "Не більше двох знаків після коми",
    qtyMin: "Кількість не може бути від’ємною",
    qtyMax: "Кількість не може перевищувати 100 000",
    qtyStep: "Кількість має бути цілим числом"
  };


  function validateField(input) {
    input.setCustomValidity("");
    const v = input.validity;
    const field = input.dataset.field;
    let message = "";

    if (v.badInput) message = MESSAGES.badNumber;
    else if (v.valueMissing) message = MESSAGES.required;
    else if (field === "name" && input.value.trim().length < 2) message = MESSAGES.name;
    else if (field === "price" && v.rangeUnderflow) message = MESSAGES.priceMin;
    else if (field === "price" && v.rangeOverflow) message = MESSAGES.priceMax;
    else if (field === "price" && v.stepMismatch) message = MESSAGES.priceStep;
    else if (field === "qty" && v.rangeUnderflow) message = MESSAGES.qtyMin;
    else if (field === "qty" && v.rangeOverflow) message = MESSAGES.qtyMax;
    else if (field === "qty" && v.stepMismatch) message = MESSAGES.qtyStep;

    if (message) input.setCustomValidity(message);
    App.render.setError(input, input.validationMessage);
    return message === "";
  }

 
  function validateAll(container) {
    const inputs = Array.from(container.querySelectorAll("[data-field]"));
    const invalid = inputs.filter(function (input) { return !validateField(input); });
    if (invalid.length > 0) invalid[0].focus();
    return invalid.length === 0;
  }

  function readValues(container) {
    return {
      name: container.querySelector('[data-field="name"]').value.trim(),
      price: Number(container.querySelector('[data-field="price"]').value),
      qty: Number(container.querySelector('[data-field="qty"]').value)
    };
  }

  function bind() {
    const form = document.getElementById("add-form");
    const search = document.getElementById("search");
    const sort = document.getElementById("sort");
    const list = document.getElementById("list");
    const clearButton = document.getElementById("clear-storage");


    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validateAll(form)) return;
      const item = App.model.add(readValues(form));
      form.reset();
      form.querySelectorAll("[data-field]").forEach(function (input) {
        input.setCustomValidity("");
        App.render.setError(input, "");
      });
      form.querySelector('[data-field="name"]').focus();
      App.render.status("Позицію «" + item.name + "» додано");
    });


    form.addEventListener("input", function (event) {
      if (event.target.classList.contains("form__input--invalid")) validateField(event.target);
    });


    search.addEventListener("input", debounce(function () {
      App.model.setQuery(search.value);
    }, 300));
    sort.addEventListener("change", function () {
      App.model.setSort(sort.value);
    });

   
    list.addEventListener("click", function (event) {
      const control = event.target.closest("[data-action]");
      if (!control || !list.contains(control)) return;
      const row = control.closest("[data-id]");
      if (!row) return;
      const id = row.dataset.id;

      switch (control.dataset.action) {
        case "toggle":
          if (event.target.matches('input[type="checkbox"]')) {
            App.model.toggle(id);
            App.render.focusIn(list, id, "toggle");
          }
          break;
        case "edit": {
          App.model.startEdit(id);
          const first = list.querySelector('[data-id="' + id + '"] [data-field="name"]');
          if (first) first.focus();
          break;
        }
        case "save":
          if (!validateAll(row)) return;
          App.model.update(id, readValues(row));
          App.render.focusIn(list, id, "edit");
          App.render.status("Зміни збережено");
          break;
        case "cancel":
          App.model.cancelEdit();
          App.render.focusIn(list, id, "edit");
          break;
        case "remove": {
          const name = row.querySelector(".item__name").textContent;
          App.model.remove(id);
          App.render.status("Позицію «" + name + "» видалено");
          break;
        }
        default:
          break;
      }
    });

    list.addEventListener("keydown", function (event) {
      const row = event.target.closest(".item--editing");
      if (!row) return;
      if (event.key === "Enter" && event.target.matches("input")) {
        event.preventDefault();
        row.querySelector('[data-action="save"]').click();
      } else if (event.key === "Escape") {
        row.querySelector('[data-action="cancel"]').click();
      }
    });

    clearButton.addEventListener("click", function () {
      App.model.clearAll();
      form.reset();
      search.value = "";
      sort.value = "added";
      App.render.status("Сховище очищено");
    });
  }

  App.events = { bind: bind, validateField: validateField };
})();
