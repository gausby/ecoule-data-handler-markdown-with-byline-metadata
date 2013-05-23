/* global require module*/
'use strict';

var rs = require('robotskirt'),
    serial = require('operandi').serial
;

var findHeader = new RegExp('((?:(?:^ *# *.+)|(?:^[\n ]*(?:.+)(?:\n={2,}\n*)))(?:\n {2}.*|\n)+)');

var findTitle = new RegExp([
    // find headlines in the format of `# Headline`
    '(?:^[\n ]*#(?: *)(.+)',
    // or
    '|',
    // find headlines in the format of `Headline\n======`
    '^[\n ]*(.+)(?:\n={2,}\n*))'
].join(''));

var findDate = new RegExp([
    // http://regex101.com/r/kP3dP0

    // a dateline starts with two white spaces
    ' {2}',
    // look for the name of a weekday, short-form and long-form
    '(?:(?:mon|tues|wednes|thurs|fri|satur|sun)day, )',
    // look for the day of the month
    '([0-9]{1,2} ',
    // look for a date, short-form and long-form, english names
    '(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*) ',
    // look for a year
    '[0-9]+',
    // look for a time
    '(?: +[0-9]{1,2}[:.][0-9]{1,2}(?:[:.][0-9]{1,2})*)*',
    ')\n*'
].join(''),'i');

var findAuthors = new RegExp([
    ' {2}',
    '(?:By:* +)',
    '(.*)',
    '\n*'
].join(''));


function MarkdownHandler (options) {
    options = options || {};
    this.name = options.name || 'Markdown Processor';
    this.match = { extname: { equals: 'md' }};
    this.type = 'html';
}

MarkdownHandler.prototype.initialize = function (done) {
    this.renderer = new rs.HtmlRenderer();
    this.parser = new rs.Markdown(this.renderer);

    done();
}

MarkdownHandler.prototype.execute = function(data, done) {
    var content = data.raw.toString(),
        header = findHeader.exec(content),
        date, title, authors
    ;

    if (header && header[1]) {
        header = header[1];

        // find the title ----------------------------------------------
        title = findTitle.exec(header);

        if (title && (title[1] || title[2])) {
            data.title = title[1] || title[2];
        }
        else {
            data.title = 'Untitled document';
        }


        // find authors ------------------------------------------------
        authors = findAuthors.exec(header);

        if (authors && authors[1]) {
            data.authors = authors[1].split(';');
            for (var i = 0; data.authors[i]; i++) {
                data.authors[i] = data.authors[i].trim();
            }
        }


        // find the publish date ---------------------------------------
        if (! ('date' in data)) {
            data.date = {};
        }

        date = findDate.exec(header);

        if (date && date[1]) {
            data.date.published = new Date(date[1]);
        }

        // slice the header off the content ---------------------------
        content = content.slice(header.length);
    }

    if (typeof data.processed !== 'object') {
        data.processed = {};
    }

    data.processed[this.type] = this.parser.render(content);

    return done();
}

module.exports = function (config) {
    return (new MarkdownHandler(config));
}