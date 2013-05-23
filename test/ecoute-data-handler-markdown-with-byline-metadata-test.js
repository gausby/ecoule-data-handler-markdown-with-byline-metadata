/*jslint maxlen:140*/
/* global require */
'use strict';

var buster = require('buster'),
    Ecoute = require('ecoute'),
    DataHandler = require('../lib/ecoute-data-handler-markdown-with-byline-metadata')
;

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;


buster.testCase('A data handler', {
    'should implement an initialize function': function () {
        var test = DataHandler();

        assert.isFunction(test.initialize);
    }
});

buster.testCase('initialization', {
    'should call its callback method at some point': function (done) {
        var test = DataHandler({});

        test.initialize(function(err) {
            refute.defined(err);
            done();
        });
    }
});

buster.testCase('execute', {
    'should transform markdown to html': function (done) {
        var test = DataHandler({});

        var obj = {
            raw: '# Foo\n**bar**'
        };

        test.initialize(function() {
            test.execute(obj, function(err) {
                assert.defined(obj.processed.html);
                done();
            });
        });
    }
});
