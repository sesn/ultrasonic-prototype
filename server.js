const http = require('http');
const express = require('express');
const app = express();
var server = http.createServer(app).listen(3001);
var io = require('socket.io').listen(server);
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//Serve static files
app.use(express.static(__dirname + '/public'));
//Serial Port communication
const serialport = require('serialport');
const readline = require('readline');
const sp_readline = serialport.parsers.Readline;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'select port> '
});

// //Socket Connection
io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function(data) {
        console.log(data);
    });
});

var idx = 0;
var ports = [];

console.log('COM port list:');
serialport.list(function(err, p) {
    p.forEach(function(p) {
        ports.push(p.comName);
        console.log(' [' + idx + '] ' + p.comName);
        idx++;
    });

    rl.prompt();

    rl.on('line', function(line) {
        //console.log(line);
        //console.log(ports);
        if (line < idx) {
            console.log('Opening ' + ports[Number(line)]);

            const port = new serialport(ports[Number(line)], {
                baudRate: 9600
            });
            const parser = new sp_readline();
            port.pipe(parser);

            parser.on('data', function(data) {
                distance = data.replace('distance', '');
                distance = distance.replace(/\n/, ' ');
                console.log(distance);
                // if (distance >= 1 && distance <= 200) {
                    io.sockets.emit('sensor_reading', {
                        ultrasonic_distance: data
                    });
                    // console.log(distance);
                // }
                // console.log(data);
            });

            port.on('error', function(e) {
                console.error(e.message);
                process.exit(0);
            });

            port.on('open', function() {
                console.log('Serial Port Opened');
            });

            port.on('close', function(err) {
                console.log('Serial Port Closed: ' + err);
                process.exit(0);
            });

        } else {
            console.error('ERROR: Wrong port number');
            process.exit(0);
        }
    });

    rl.on('close', function() {
        console.log('Bye!');
        process.exit(0);
    });

});

var routes = require('./routes/router');
// app.get('/', function(req, res){
//     res.send('Hello world');
// });