function parseComponent(elem, scope){
    scope = scope || {};
    var htmlElement = elem;

    if($(htmlElement).attr("data-init") == "false") { return; }

    require([$(htmlElement).attr("data-component")], function(component){
        if(typeof component == 'function'){
            var comp = new component(htmlElement, scope);
        }
    });
}

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

var timeStep = 30;
var serverTime = 0;
var serverDif = 0;

var authSerialKey = '';
var authKey = authSerialKey;

function saveSerial(){
    authSerialKey = String($('#serialDisplay').val()).toLowerCase();

    //clear serial
    $('#serialDisplay').val('');

    authKey = authSerialKey; //Hashing 1000 times the serial key.
    for(var i=0; i < 1000; i++){
        authKey = sha256(authKey);
    }

    console.log('KEY SAVED', authKey);
}

function generateHash(){
    var time = Date.parse(new Date().toUTCString());
        //set the time according with server difference
        time = time + serverDif;

        time = Math.floor(time / 1000);
    var step = Math.floor(time / timeStep);

    var code = sha256(authKey + step);

    return code;
}

function syncTimeWithServer(){
    //Sync with server
    $.ajax({
        type: 'GET',
        url: '/sync-time/',
        cache: false,
        contentType: 'json',
        processData: false
    }).done(function(data) {
        serverTime = parseInt(JSON.parse(data).time);

        var serverTimeMillisGMT = Date.parse(new Date(serverTime).toUTCString());
        var localMillisUTC = Date.parse(new Date().toUTCString());

        serverDif = serverTimeMillisGMT -  localMillisUTC;

        console.log('server synced', serverTime, serverDif);

        generateHash();
    });
}

function sendAuth(){
    //Sync with server
    $.ajax({
        type: 'GET',
        url: '/check-auth/?code='+$('#chatMessage').val(),
        cache: false,
        contentType: 'json',
        processData: false
    }).done(function(data) {
        console.log(data);
    });
}

function sendSerial(){
    //Sync with server
    $.ajax({
        type: 'GET',
        url: '/send-serial/?code='+$('#serialKey').val(),
        cache: false,
        contentType: 'json',
        processData: false
    }).done(function(data) {
        console.log(data);

        //clear serial
        $('#serialKey').val('');
    });
}

var prevStep = 0;
function generateCode(){
    var time = new Date().getTime();
        time = Math.floor(time / 1000);
    var step = Math.floor(time / timeStep);

    if(prevStep != step){
        prevStep = step;
        var hash = generateHash();
            hash = hash.substring(0, 8);
        $('#authDisplay').val(hash);
    }
}

(function($){
    $(document).ready(function(){

        //Sync time with the server
        syncTimeWithServer();

        setInterval(function(){
            generateCode();
        }, 1000);

        var socket = io.connect('/rtc');
            socket.on('msg', function (data) {
                console.log('received', data);

                appendMsg('received', data.data);
            });

        $('#sendMessage').click(function(){
            sendAuth();
        });

        $('#sendSerial').click(function(){
            sendSerial();
        });

        $('#syncTime').click(function(){
            syncTimeWithServer();
        });

        $('#generateSerial').click(function(){
            $('#serialDisplay').val(randomiseString('aa-aaaaaa-aaaa-aaa-a'));
        });

        $('#saveSerial').click(function(){
            saveSerial();
            //invalidate clock and generate new code
            prevStep = 0;
            generateCode();
        });

        $(document).keypress(function(e) {
            if(e.which == 13) {
                sendMsg();
            }
        });

    });
})(jQuery);