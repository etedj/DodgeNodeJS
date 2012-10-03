// Including libraries
console.log("Start");
var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	static = require('node-static'); // for serving files

// This will make all the files in the current folder
// accessible from the web
var fileServer = new static.Server('./');
	
// This is the port for our web server.
// you will need to go to http://localhost:8080 to see it
app.listen(8080);

// If the URL of the socket server is opened in a browser
function handler (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {
    console.log("New Connection!");
    // Start listening for mouse move events
	socket.on('update', function (data) {
		socket.broadcast.emit('update', data);
	});
    socket.on('removeEnemy', function (data) {
		socket.broadcast.emit('removeEnemy', data);
	});
    socket.on('death', function (data) {
		socket.broadcast.emit('death', data);
	});
});

var HEIGHT = 1000;
var WIDTH = 1900;
var PROB_NEW = 0.50;
var PROB_GOOD = 0.05;
var MAX_SPEED = 5;
function generateEnemy() {
    if (Math.random() > PROB_NEW)
    {
        return;
    }
    var result;
    var side = Math.floor(Math.random()*4); //Which side it starts on
    var speed = Math.floor(Math.random()*MAX_SPEED) + 1;
    var isGood = (Math.random() < PROB_GOOD);
    var guid = getGuid();
    if (side == 0) //WEST
    {	
        result = { id:guid, x:0, y:Math.floor(Math.random()*HEIGHT), vX:speed, vY:0, good:isGood };
    }
    else if (side == 1) //EAST
    {
        result = { id:guid, x:WIDTH, y:Math.floor(Math.random()*HEIGHT), vX:-1*speed, vY:0, good:isGood };
    }
    else if (side == 2) //NORTH
    {
        result = { id:guid, x : Math.floor(Math.random()*WIDTH), y:0, vX:0, vY:speed, good:isGood };
    }
    else //SOUTH
    {
        result = { id:guid, x:Math.floor(Math.random()*WIDTH), y:HEIGHT, vX:0, vY:-1*speed, good:isGood };
    }
    io.sockets.emit("createEnemey", result);
}
setInterval(generateEnemy, 100);

function getGuid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}