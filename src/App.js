'use strict';

var request = require('request'),
    _ = require('lodash'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    moment = require('moment-timezone');

function App(options) {
    this._options = _.assign({
        id: 'vma-texttv',
        pageNumber: 599,
        intervalInMinutes: 30,
        output: './out/'
    }, options);

    this._url = 'https://api.texttv.nu/api/get/'+this._options.pageNumber+'?app='+this._options.id;
}

module.exports = App;

App.prototype.start = function () {
    var self = this;
    self._run();
    self._interval = setInterval(() => {
        self._run();
    }, self._options.intervalInMinutes * 60 * 1000);
};

App.prototype._run = function (callback) {
    var self = this;
    request(self._url, (err, response, body) => {
        var now = new Date().toISOString();
        if (err) {
            console.error(now, 'Error performing HTTP request', err);
        }
        else if (response.statusCode != 200) {
            console.warn(now, 'Warning', 'Server returned with unexpected status code', response, body);
        }
        else {
            var page = _.find(JSON.parse(body), p => p.num == self._options.pageNumber);
            if (!page) {
                console.error(now, 'Error finding page', self._options.pageNumber);
                return;
            }

            var htmlBody = page.content[0];
            if (/Sidan ej i sändning/.test(htmlBody)) {
                console.info(now, 'Inget meddelande.');
            }
            else {
                var timestamp = moment(page.date_updated_unix * 1000);
                var directory = self._options.output + timestamp.format('YYYY/MM-MMMM/');
                var fileName = timestamp.format('YYYY-MM-DD[T]HH.mm.ssZZ[.json]');
                var path = directory + fileName;
                mkdirp(directory, err => {
                    if (err) {
                        console.error(now, 'Error creating directory', err);
                        console.log(now, 'Viktigt meddelande!', page.title);
                    }
                    else {
                        fs.open(path, 'wx', (err, fd) => {
                            if (err) {
                                if (err.code !== "EEXIST") {
                                    console.error(now, 'Error opening file', err);
                                }

                                console.log(now, 'Viktigt meddelande!', page.title);
                            }
                            else {
                                fs.writeFile(fd, JSON.stringify(page, null, 2), err => {
                                    if (err) {
                                        console.error(now, 'Error writing to file', err);
                                    }
                                    else {
                                        console.log(now, 'Viktigt meddelande! (NY)', page.title);
                                        console.log(now, 'Saved to file', path);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
};
