
(function () {
  "use strict";

  const results = { runtime: [], parse: [] };

  function check(id, title, action) {
    let value;
    try {
      value = String(action());
    } catch (error) {
      value = error.name + ": " + error.message;
    }
    results.runtime.push({ id: id, title: title, value: value });
  }

  function parse(id, title, body) {
    let value;
    try {
      value = String(new Function('"use strict"; ' + body)());
    } catch (error) {
      value = error.name + ": " + error.message;
    }
    results.parse.push({ id: id, title: title, value: value });
  }

  const frozen = Object.freeze({ a: 1 });

  check("undeclared", "неоголошена змінна", function () {
    undeclaredOn = 1;
    return undeclaredOn;
  });
  check("this", "this у функції", function () {
    return (function () { return this; })();
  });
  check("frozen-write", "запис у заморожений об’єкт", function () {
    frozen.a = 2;
    return frozen.a;
  });
  check("frozen-add", "нова властивість у заморожений об’єкт", function () {
    frozen.b = 2;
    return frozen.b;
  });
  check("delete-proto", "delete Object.prototype", function () {
    return delete Object.prototype;
  });
  check("getter", "запис у властивість лише з getter", function () {
    const obj = { get x() { return 1; } };
    obj.x = 2;
    return obj.x;
  });
  check("arguments", "arguments і параметр", function () {
    return (function (a) { a = 2; return arguments[0]; })(1);
  });

  parse("with", "інструкція with", "with (Math) { return PI; }");
  parse("octal", "літерал 010", "return 010;");
  parse("dup-params", "однакові параметри", "return (function (a, a) { return a; })(1, 2);");
  parse("delete-var", "delete змінної", "var v = 1; delete v; return v;");

  window.StrictLab = window.StrictLab || {};
  window.StrictLab.on = results;
})();
