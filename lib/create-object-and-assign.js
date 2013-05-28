/* global module */
'use strict';

module.exports = function (root, input, value) {
    var current, i,
        // clean up the input and split on . or [
        keys = input.replace(/]|\"|\'/, '').split(/\.|\[/),
        // the key we will ultimatly store the value in
        key = keys.pop()
    ;

    for (i = 0; typeof keys[i] === 'string'; i += 1) {
        current = keys[i];

        if (typeof root[current] !== 'object') {
            root[current] = {};
        }

        // set new root
        root = root[current];
    }

    root[key] = value;

    return;
}
