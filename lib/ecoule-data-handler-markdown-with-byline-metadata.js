/* global require module*/
'use strict';

var rs = require('robotskirt'),
    patterns = require('./search-patterns'),
    createObjectKeysAndAssign = require('./create-object-and-assign'),
    serial = require('operandi').serial,
    eachSerial = require('operandi').eachSerial
;


/**
 * Convert markdown data in a ecoule data object to html and look for
 * configured metadata attributes.
 *
 * @class MarkdownHandler
 * @param {Object} options
 */
function MarkdownHandler (options) {
    options = options || {};
    this.name = options.name || 'Markdown Processor';
    this.input = options.input || 'raw';
    this.match = options.match || { extname: { equals: '.md' }};

    this.metadata = options.metadata || { 'title': patterns.title };

    this.output = options.output || 'html';
}


/**
 * Initialize a markdown render and parser for this instance, then initialize
 * all the metadata fetchers that are defined in the config.
 *
 * @function initialize
 * @param {Function} done callback that needs to be called when initialization is done
 */
MarkdownHandler.prototype.initialize = function (done) {
    // initialize the markdown renderer and parser
    this.renderer = new rs.HtmlRenderer();
    this.parser = new rs.Markdown(this.renderer);

    // initialize the meta data fetchers
    for (var key in this.metadata) {
        if (typeof this.metadata[key] === 'string') {
            if (typeof patterns[this.metadata[key]] === 'function') {
                this.metadata[key] = patterns[this.metadata[key]]();
            }
            else {
                return done(new Error(this.metadata[key] + ' is not defined as a pattern.'));
            }
        }
        else if (typeof this.metadata[key] === 'function') {
            this.metadata[key] = this.metadata[key]();
        }
    }

    return done();
};


/**
 * Analyse data, parse it with the markdown parser and search for metadata in
 * the header.
 *
 * @method execute
 * @param {Object} data
 * @param {Function} done callback that needs to be called when processing is done
 */
MarkdownHandler.prototype.execute = function(data, done) {
    var content = data[this.input].toString(),
        header = patterns.header.exec(content)
    ;

    header = (header && header[1]) ? header[1] : undefined;

    if (! header) {
        // no byline header, just parse the file and bail out
        createObjectKeysAndAssign(data, this.output, this.parser.render(content));
        return done();
    }

    // Header found, find and fetch metadata, parse content
    return serial.call(this, [
        function(done) {
            var metadata = this.metadata;

            // find every defined metadata field
            eachSerial(Object.keys(metadata), function(field, key, done) {
                key = field[key];
                // pass the header for metadata fetching
                metadata[key](header, function(err, result) {
                    if (err) {
                        return done(err);
                    }

                    if (result !== undefined) {
                        // create a key on the data object with the result
                        // of the metadata fetcher.
                        createObjectKeysAndAssign(data, key, result);
                    }

                    return done();
                });
            }, done);
        },
        function(done) {
            // slice the header off the content
            content = content.slice(header.length);

            return done();
        }
    ],
    function (err) {
        // parse the markdown and store the result in the output key.
        createObjectKeysAndAssign(data, this.output, this.parser.render(content));

        return done(err);
    });
};

module.exports = function (config) {
    return (new MarkdownHandler(config));
};