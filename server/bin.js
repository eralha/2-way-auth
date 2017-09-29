var express = require('express');
var port = process.env.PORT || 8080;
var app = express();
var server = require('http');
var path = require('path');
var sha256 = require('js-sha256');


app.server = server.createServer(app);
var socket = require('./socket')(app.server);

var auth2Way = require('./auth');
    auth2Way = new auth2Way.api({ window: 2, timeStep: 30 });

var authSerialKey = auth2Way.generateToken();


app.get('/', function(request, response) {
    response.sendFile(path.resolve(__dirname + '/../www/index.html'));
});

//End point for ajax user auth
app.get('/check-auth/', function(request, response) {
	var token = request.query.code;

	//If a token is not posted
	if(!request.query.code){
		response.send(JSON.stringify({match:false}));
		return;
	}

    response.send(JSON.stringify(auth2Way.verifyToken(token, authSerialKey)));
});

app.get('/sync-time/', function(request, response) {
	var time = Date.parse(new Date().toUTCString());
		//time = time - (1000 * 60 * 60);//Simulate 1h difference

    response.send(JSON.stringify({time:time}));
});

app.get('/send-serial/', function(request, response) {
    authSerialKey = auth2Way.generateToken(String(request.query.code).toLowerCase());

	console.log('KEY SAVED', authSerialKey);
    response.send(JSON.stringify({serialSaved: true}));
});

app.use('/js', express.static(__dirname + '/../www/js'));
app.use('/images', express.static(__dirname + '/../www/images'));

app.server.listen(port, function () {
  console.log('Example app listening on port '+port);
});