(function (modules) {
        const require = (moduleId) => {
            const module = {
                exports: {}
            }
            modules[moduleId].call(module.exports, module, module.exports, require);
            return module.exports.default;
        }

        require('./demo/code.js');

    })({'./demo/code.js':function(module,exports,require){
            "use strict";

var _module = require("./module1.js");

var a = 131;
var b = 131;

console.log("code.js");
console.log((0, _module.add)(a, b));
console.log((0, _module.minus)(a, b));
console.log((0, _module.pursu)(a, b));
console.log((0, _module.divide)(a, b));

[1, 2, 3, 34].includes(2);
        },'./module1.js':function(module,exports,require){
            "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var add = function add(a, b) {
  return a + b;
};
var minus = function minus(a, b) {
  return a - b;
};
var pursu = function pursu(a, b) {
  return a * b;
};
var divide = function divide(a, b) {
  return a / b;
};

exports.default = {
  add: add,
  minus: minus,
  pursu: pursu,
  divide: divide
};
        },})