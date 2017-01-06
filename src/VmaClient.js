'use strict';

const path = require('path');
const events = require('events');
const spawn = require('child_process').spawn;
const assign = require('lodash').assign;
const isArray = require('lodash').isArray;
const moment = require('moment-timezone');

const SverigesRadioClient = require('./SverigesRadioClient');
const SmsClient = require('./SmsClient');
const WriteAllText = require('./writeAllText');

class VmaClient {
    constructor(options) {
        this._options = assign({
            pollInterval: 30*60*1000,
            smsKey: '',
            smsSecret: '',
            smsRecipents: [],
            outputDirectory: './out',
            exec: ''
        }, options);

        this._messages = {};

        this._vma = new SverigesRadioClient(this._options.url);
        this._sms = new SmsClient({
            key: this._options.smsKey,
            secret: this._options.smsSecret,
            sender: 'VMA'
        });

        this._events = new events();
    }

    on(eventName, listener) {
        this._events.on(eventName, listener);
        return this;
    }

    start() {
        this.stop();
        this._getMessages().then(() => {
            this._interval = setInterval(() => {
                this._getMessages();
            }, this._options.pollInterval);
        });
    }

    stop() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }

    _getMessages() {
        return this._vma.getMessages()
            .then(messages => {
                this._fire('messages', messages);

                if (messages.length < 1)
                    return Promise.resolve();

                let tasks = [
                    this._saveMessages(messages),
                    this._exec(messages)
                ];

                messages.forEach(message => {
                    let old = this._messages[message.id];
                    let type = 'unchanged';
                    if (!old) {
                        type = 'new';
                        tasks.push(this._sendMessage(message));
                    }
                    else if (this._isMessagesDifferent(old, message)) {
                        type = 'updated';
                    }

                    this._fire('message', message, type);
                    this._messages[message.id] = message;
                });

                return Promise.all(tasks);
            })
            .catch(error => {
                this._fire('error', error);
            });
    }

    _isMessagesDifferent(a,b) {
        return a.title === b.title && a.description === b.description;
    }

    _sendMessage(message) {
        let recipents = this._options.smsRecipents || [];
        if (recipents.length < 1)
            return Promise.resolve();

        return this._sms.send(`${message.title} - ${message.description}`, recipents)
            .then(() => this._fire('sms', recipents));
    }

    _saveMessages(messages) {
        let fileName = path.join(
            this._options.outputDirectory,
            moment().format('YYYY[/]MM-MMMM[/]YYYY-MM-DD[T]HH.mm.ssZZ[.json]')
        );

        return WriteAllText(fileName, JSON.stringify(messages, null, 2))
            .then(() => this._fire('fileWritten', messages, fileName));
    }

    _exec(messages) {
        return new Promise((resolve) => {
            let text = messages.map(m=>`${m.title} - ${m.description}`).join(' | ');

            let exec = this._options.exec;
            if (exec) {
                if (this._vmaProcess) {
                    this._vmaProcess.kill();
                }

                this._vmaProcess = spawn(exec, [text.trim()], {
                    detached: true,
                    stdio: ['ignore','ignore','ignore']
                });

                this._vmaProcess.unref();
                this._fire('exec', messages, exec);
            }

            resolve();
        });
    };

    _fire() {
        let args = Array.prototype.slice.call(arguments);
        this._events.emit.apply(this._events, args);
    }
}

module.exports = VmaClient;