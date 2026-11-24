
(function () {
  "use strict";

  const App = (window.App = window.App || {});

  function money(value) {
    return value.toFixed(2) + " ₴";
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(label, action, extraClass) {
    const node = el("button", "button button--small" + (extraClass ? " " + extraClass : ""), label);
    node.type = "button";
    node.dataset.action = action;
    return node;
  }

 
  function field(name, label, attrs, value) {
    const wrap = el("div", "form__field");
    const id = "edit-" + name;
    const lbl = el("label", "form__label", label);
    lbl.htmlFor = id;
    const input = el("input", "form__input");
    input.id = id;
    input.dataset.field = name;
    Object.keys(attrs).forEach(function (key) { input.setAttribute(key, attrs[key]); });
    input.value = value;
    const error = el("p", "form__error");
    error.id = id + "-error";
    error.setAttribute("role", "alert");
    input.setAttribute("aria-describedby", error.id);
    wrap.append(lbl, input, error);
    return wrap;
  }

  function viewRow(row) {
    const item = row.item;
    const li = el("li", "item" + (item.selected ? " item--selected" : ""));
    li.dataset.id = item.id;

    const check = el("input", "item__check");
    check.type = "checkbox";
    check.checked = item.selected;
    check.dataset.action = "toggle";
    check.setAttribute("aria-label", "Вибрати «" + item.name + "»");

    const info = el("div", "item__info");
    info.append(
      el("strong", "item__name", item.name),
      el("span", "item__meta", money(item.price) + " × " + item.qty + " шт = " + money(row.total))
    );

    const actions = el("div", "item__actions");
    actions.append(
      button("Редагувати", "edit"),
      button("Видалити", "remove", "button--danger")
    );

    li.append(check, info, actions);
    return li;
  }

  function editRow(row) {
    const item = row.item;
    const li = el("li", "item item--editing");
    li.dataset.id = item.id;

    const fields = el("div", "item__fields");
    fields.append(
      field("name", "Назва", { type: "text", required: "", minlength: "2", maxlength: "60", autocomplete: "off" }, item.name),
      field("price", "Ціна, ₴", { type: "number", required: "", min: "0.01", max: "1000000", step: "0.01" }, String(item.price)),
      field("qty", "Кількість", { type: "number", required: "", min: "0", max: "100000", step: "1" }, String(item.qty))
    );

    const actions = el("div", "item__actions");
    const save = button("Зберегти", "save", "button--primary");
    actions.append(save, button("Скасувати", "cancel"));

    li.append(fields, actions);
    return li;
  }


  function list(container, rows, editingId, emptyText) {
    const nodes = rows.map(function (row) {
      return row.item.id === editingId ? editRow(row) : viewRow(row);
    });
    if (nodes.length === 0) {
      const empty = el("li", "list__empty", emptyText);
      nodes.push(empty);
    }
    container.replaceChildren(...nodes);
  }

  function summary(stats) {
    document.getElementById("stat-count").textContent = stats.shown + " / " + stats.count;
    document.getElementById("stat-total").textContent = money(stats.total);
    document.getElementById("stat-filtered").textContent = money(stats.filtered);
    document.getElementById("stat-selected").textContent = stats.selectedCount + " / " + money(stats.selectedTotal);
  }

  function status(text) {
    document.getElementById("status").textContent = text;
  }


  function setError(input, message) {
    const holder = document.getElementById(input.getAttribute("aria-describedby"));
    if (holder) holder.textContent = message;
    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.classList.add("form__input--invalid");
    } else {
      input.removeAttribute("aria-invalid");
      input.classList.remove("form__input--invalid");
    }
  }

  function focusIn(container, id, action) {
    const target = container.querySelector('[data-id="' + id + '"] [data-action="' + action + '"]');
    if (target) target.focus();
  }

  App.render = { money: money, list: list, summary: summary, status: status, setError: setError, focusIn: focusIn };
})();
