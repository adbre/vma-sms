'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

function writeAllText(p, text) {
    return new Promise((resolve, reject) => {
        mkdirp(path.dirname(p), err => {
            if (err) {
                reject(err);
            }
            else {
                fs.open(p, 'w', (err, fd) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        fs.writeFile(fd, text, err => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            }
        });
    });
}

module.exports = writeAllText;