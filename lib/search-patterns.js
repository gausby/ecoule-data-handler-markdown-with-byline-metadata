/* global module */
'use strict';

var searchPatterns = {
    header: new RegExp('((?:(?:^ *# *.+)|(?:^[\n ]*(?:.+)(?:\n={2,}\n*)))(?:\n {2}.*|\n)+)'),

    title: function () {
        var pattern = new RegExp([
            // find headlines in the format of `# Headline`
            '(?:^[\n ]*#(?: *)(.+)',
            // or
            '|',
            // find headlines in the format of `Headline\n======`
            '^[\n ]*(.+)(?:\n={2,}\n*))'
        ].join(''));

        return function (subject, done) {
            var title = pattern.exec(subject);
            // first index would be #-style headlines
            // second would be Title\n=====-style
            title = title[1] || title[2] || undefined;
            done(undefined, title);
        };
    },

    date: function () {
        var pattern = new RegExp([
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

        return function (subject, done) {
            var date = pattern.exec(subject);
            if (date && date[1]) {
                date = new Date(date[1]);
            }
            else {
                date = undefined;
            }
            done(undefined, date);
        };
    },

    authors: function (){
        var pattern = new RegExp([
            ' {2}',
            '(?:By:* +)',
            '(.*)',
            '\n*'
        ].join(''));

        return function (subject, done) {
            var authors = pattern.exec(subject);

            if (authors && authors[1]) {
                authors = authors[1].split(';');
                for (var i = 0; authors[i]; i++) {
                    authors[i] = authors[i].trim();
                }
            }
            else {
                authors = undefined;
            }

            done (undefined, authors);
        };
    }
};

module.exports = searchPatterns;