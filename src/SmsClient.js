'use strict';

const request = require('request');

class SmsClient {
    constructor(options) {
        this.key = options.key;
        this.secret = options.secret;
        this.sender = options.sender;
    }

    send(message, recipents) {
        if (recipents.length < 1) return Promise.reject('Cannot send SMS: No recipents');
        if (!this.key) return Promise.reject('Cannot send SMS: API key was not set');
        if (!this.secret) return Promise.reject('Cannot send SMS: API secret was not set');
        if (!this.sender) return Promise.reject('Cannot send SMS: Sender was not set');

        return new Promise((resolve, reject) => {
            request.post({
                url: 'https://gatewayapi.com/rest/mtsms',
                oauth: {
                    consumer_key: this.key,
                    consumer_secret: this.secret
                },
                json: true,
                body: {
                    sender: this.sender,
                    message: message,
                    recipients: recipents.map(n => { return { msisdn: n };})
                },
            }, function (err, response, body) {
                if (err) {
                    reject(err);
                }
                else if (!body.ids || body.ids.slice !== Array.prototype.slice) {
                    reject(body);
                }
                else {
                    resolve(body);
                }
            });
        });
    }
}

module.exports = SmsClient;
