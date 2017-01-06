'use strict';

const assign = require('lodash').assign;
const fs = require('fs');

const VmaClient = require('./src/VmaClient');

let now=()=>new Date().toISOString();

let options = {
    outputDirectory: './out',
    pollInterval: 30*60*1000,
    smsKey: process.env.VMA_SMS_KEY,
    smsSecret: process.env.VMA_SMS_SECRET,
    smsRecipents: (process.env.VMA_SMS_RECIPENTS||'').split(','),
    exec: process.env.VMA_EXEC
};

if (fs.existsSync('./config.js')) {
    options = assign(options, require('./config'));
}

if (!!process.env.VMA_SMS_DISABLED) {
    console.log(now(), 'SMS is disabled');
    options.smsRecipents = [];
}

let client = new VmaClient(options);
client.on('error', err => console.log(now(), 'ERROR', err));
client.on('sms', r => console.log(now(), 'SMS skickat till', r));
client.on('fileWritten', (m,n) => console.log(now(), 'Sparat meddelanden till ', n));
client.on('exec', (m,e) => console.log(now(), 'Startat program', e));
client.on('messages', m => {
    if (m.length < 1)
        console.log(now(), 'Inga meddelanden');
    else
        console.log(now(), `Viktigt meddelande (${m.length} st)`);
});
client.start();
