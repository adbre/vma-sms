'use strict';

const request = require('request');

class SverigesRadioClient {
    constructor(url) {
        this._url = url || 'https://api.sr.se/api/v2/vma?format=json';
    }

    getMessages() {
        return new Promise((resolve, reject) => {
            request(this._url, (err, response, body) => {
                if (err) {
                    reject(err);
                }
                else if (response.statusCode !== 200) {
                    reject({
                        message: 'Server returned unexpected status code',
                        response: response,
                        body: body
                    });
                }
                else {
                    resolve(JSON.parse(body).messages);
                }
            });
        });
    }
}

module.exports = SverigesRadioClient;
