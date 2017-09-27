var express = require('express');
var port = process.env.PORT || 8080;
var app = express();
var server = require('http');
var path = require('path');
var sha256 = require('js-sha256');

var timeStep = 30;
var authSerialKey = 'xxx'; //This should be random generated with a strong random algortm.
var authKey = authSerialKey; //Hashing 1000 times the serial key.

function saveSerial(authSerialKey){
    authKey = authSerialKey; //Hashing 1000 times the serial key.
    for(var i=0; i < 1000; i++){
        authKey = sha256(authKey);
    }
    delete authSerialKey;
}

app.server = server.createServer(app);
var socket = require('./socket')(app.server);

app.get('/', function(request, response) {
    response.sendFile(path.resolve(__dirname + '/../www/index.html'));
});

//End point for ajax user auth
app.get('/check-auth/', function(request, response) {
	var token = request.query.code;

	//If we dont post a code
	if(!request.query.code){
		response.send(JSON.stringify({match:false}));
		return;
	}

	var time = Date.parse(new Date().toUTCString());
		//time = time - (1000 * 60 * 60);//Simulate 1h difference
        time = Math.floor(time / 1000);

    var step = Math.floor(time / timeStep);
    var match = false;

    var limit = 2;
    for(var i = 0; i < limit; i++){
    	var codeForward = sha256(authKey + (step + i));
    	var codeBackward = sha256(authKey + (step - i));

    	if(String(codeForward).indexOf(token) == 0 || String(codeBackward).indexOf(token) == 0){
    		match = true;
    	}
    }

    response.send(JSON.stringify({match:match}));
});

app.get('/sync-time/', function(request, response) {
	var time = Date.parse(new Date().toUTCString());
		//time = time - (1000 * 60 * 60);//Simulate 1h difference

    response.send(JSON.stringify({time:time}));
});

app.get('/send-serial/', function(request, response) {
	saveSerial(String(request.query.code).toLowerCase());

	console.log('KEY SAVED', authKey);
    response.send(JSON.stringify({serialSaved: true}));
});

app.use('/js', express.static(__dirname + '/../www/js'));
app.use('/images', express.static(__dirname + '/../www/images'));

app.server.listen(port, function () {
  console.log('Example app listening on port '+port);
});

