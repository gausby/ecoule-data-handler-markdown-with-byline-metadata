/* global require */
'use strict';

var buster = require('buster'),
    Ecoule = require('ecoule'),
    dataHandler = require('../lib/ecoule-data-handler-markdown-with-byline-metadata')
;

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;


buster.testCase('A data handler', {
    'should implement an initialize function': function () {
        var test = dataHandler();

        assert.isFunction(test.initialize);
    }
});

buster.testCase('initialization', {
    'should call its callback method at some point': function (done) {
        var test = dataHandler({});

        test.initialize(function(err) {
            refute.defined(err);
            done();
        });
    }
});

buster.testCase('execute', {
    'should transform markdown to html': function (done) {
        var test = dataHandler({
            output: 'html'
        });

        var obj = {
            raw: '# Foo\n**bar**'
        };

        test.initialize(function() {
            test.execute(obj, function(err) {
                assert.defined(obj.html);
                assert.equals('<p><strong>bar</strong></p>\n', obj.html);
                done();
            });
        });
    },

    'should accept custom metadata fields': function (done) {
        var rating = function () {
            var pattern = new RegExp(' {2}Rating: ([0-9]{1,2})');

            return function (subject, done) {
                var rating = pattern.exec(subject);

                if (rating && rating[1]) {
                    rating = rating[1];
                }
                else {
                    rating = undefined;
                }
                done(undefined, rating);
            };
        };

        var test = dataHandler({
            metadata: {
                stars: rating
            }
        });

        var obj = {
            raw: '# Foo\n  Rating: 10\nBar'
        };

        test.initialize(function() {
            test.execute(obj, function(err) {
                assert.defined(obj.stars);
                assert.equals(obj.stars, 10);
                done();
            });
        });
    },

    'should accept custom key name to predefined metadata field fetchers': function (done) {
        var test = dataHandler({
            metadata: {
                'authors.writers': 'authors'
            }
        });

        var obj = {
            raw: '# Foo\n  By John Doe\nBar'
        };

        test.initialize(function() {
            test.execute(obj, function(err) {
                assert.defined(obj.authors);
                assert.defined(obj.authors.writers);
                assert.equals(obj.authors.writers.toString(), 'John Doe');

                done();
            });
        });
    },

    'should accept a custom input data field with markdown data': function (done) {
        var test = dataHandler({
            input: 'input',
            output: 'output'
        });

        var obj = {
            input: '# Foo\nBar Baz\n'
        };

        test.initialize(function() {
            test.execute(obj, function(err) {
                assert.defined(obj.output);
                assert.equals(obj.output, '<p>Bar Baz</p>\n');
                done();
            });
        });
    },
    '// should be able to store custom keys in objects': function (done) {}
});
