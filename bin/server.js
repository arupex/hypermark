#!/usr/bin/env node
'use strict';

const spawnSync = require('child_process').spawnSync;
const fs = require('fs');
const http = require('http');
const port = process.env.PORT || 9000;

const readFile = fs.readFile;
const writeFile = fs.writeFile;
const dir = fs.readdirSync;

let openByPlatform = {
    darwin : 'open',
    win32 : 'explorer.exe',
    win64 : 'edge.exe',
    linux : 'xdg-open'
}[process.platform];

const drr = `${process.cwd()}/hypermarkData`;

spawnSync('mkdir', ['-p', `${drr}`]);
spawnSync('rm', ['-rf', `${drr}/*`]);


let clients = [];

let endpoints = {

    'POST /api/v1/analytic' : (req, res, body) => {
        writeFile(`${drr}/${Date.now()}.json`, body, 'utf8');
        writeToClients(res, body);
    },

    'GET /api/v1/data' : (req, res, body) => {

        let filesIndDir = dir(drr).map( e => require(`${drr}/${e}`));
        req.socket.setTimeout(2147483647);

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write('\n');

        res.write('data:'+JSON.stringify(filesIndDir) + '\n\n');

        clients.push(req);
    },

};

function writeToClients (res, data) {
    const s = (typeof data === 'string'?data:JSON.stringify(data) );
    res.write('data:'+ s + '\n\n')
}

let endpointNames = Object.keys(endpoints);

let disconnectClient = function (req) {
    clients = clients.filter(e => e !== req);
};

let server = http.createServer((req, res) => {

    let methodUrl = `${req.method.toUpperCase()} ${req.url}`;

    let findUrl = endpointNames.find( e => methodUrl.includes(e) );


    let body = [];
    req.on('data', (data) => {
        body.push(data);
    });

    req.on('close', () => {
        // disconnectClient(req);
    });

    req.on('end', () => {

        disconnectClient(req);
        body = body.join('');

        if(findUrl) {
            return endpoints[findUrl](req, res, body);
        }
        else {

            res.statusCode = 200;
            let file = 'index.html';
            if(req.url !== '/') {
                file = req.url;
            }

            if(!/\.css|\.html|\.js|\.htm|\.json/.test(file)) {
                readFile(`${__dirname}/../www/${file}`, (err, data) => {
                    if (err) {
                        return res.end();
                    }
                    res.setHeader('Content-Type', 'image/png');
                    res.end(data);
                });
                return;
            }

            return readFile(`${__dirname}/../www/${file}`, 'utf8', (err, data) => {
                if (err) {
                    return res.end(JSON.stringify({
                        err : err.message,
                        stack: err.stack
                    }, null, 3));
                }
                res.end(data);
            });

        }
    });

    req.on('error', () => {

    })

});

server.listen(port);



let url = `http://localhost:${port}`;

console.log(`opening in browser : ${url}`);


spawnSync(openByPlatform, [
    url
], { stdio : 'inherit' });
