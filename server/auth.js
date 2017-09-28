var sha256 = require('js-sha256');


/*
	Example config:
	{
		window: 2, //number of timesteps that will search forward and backward for a match
		timeStep: 30, //each X seconds is a step, defaults to 30 seconds
	}
*/


function randomised(len) {
    return Math.floor(Math.random() * len);
}

function randomiseString(str){
    var chars = "0123456789abcdefghijklmnopqrstuvwxyz0123456789";
    var nums = "abcdefghijklmnopqrstuvwxyz0123456789";

    str.replace(/[0-9]/g, function () {
        console.log('sdsd');
        return nums[randomised(nums.length)];
    });
    str = str.replace(/[a-z]/g, function () {
        return chars[randomised(chars.length)].toUpperCase();
    });

    return str;
}

function auth(config){
	this.config = config || {};
	this.timeStep = 30 || config.timeStep;
}

auth.prototype.generateToken = function(authSerialKey){
	var authKey = authSerialKey || this.generateRandomSerial(); //Hashing 1000 times the serial key.
    for(var i=0; i < 1000; i++){
        authKey = sha256(authKey);
    }

    return authKey;
}

auth.prototype.generateRandomSerial = function(){
    return randomiseString('aa-aaaaaa-aaaa-aaa-a');
}

auth.prototype.verifyToken = function(token, authKey, config){
	config = config || {};

	var time = Date.parse(new Date().toUTCString());
	//time = time - (1000 * 60 * 60);//Simulate 1h difference
    time = Math.floor(time / 1000);

    var step = Math.floor(time / (config.timeStep || this.timeStep));
    var match = false;
    var delta = 0;

    var limit = this.config.window || config.window || 2;
    for(var i = 0; i < limit; i++){
    	var codeForward = sha256(authKey + (step + i));
    	var codeBackward = sha256(authKey + (step - i));

    	if(String(codeForward).indexOf(token) == 0 || String(codeBackward).indexOf(token) == 0){
    		match = true;
    	}

    	if(String(codeBackward).indexOf(token) == 0){ delta = 0 - i;}
    }

    return (match) ? {match: true, delta: delta} : {match: false};
}

module.exports = function (config) {
	return new auth();
}