module.exports = function (server) {

	var io = require('socket.io')(server);


	var rtc = io.of('/rtc').on('connection', function (socket) {

		/*
			console.log('---------------------------------');
			for(i in rtc.connected){
				if(socket.id == rtc.connected[i].id){ console.log('socket found', rtc.connected[i].id); }
				console.log(rtc.connected[i].id);
			}
		*/

		  socket.on('joinRoom', function (room) {
		  	socket.emit('msg', 'room joined');
		  	socket.join(room);
		  });

		  socket.on('leaveRoom', function (room) {
		  	socket.emit('msg', 'room leaved');
		  	socket.leave(room);
		  });

		  socket.on('emitRoom', function (data) {
		  	//console.log(data, rtc.adapter.rooms);
		  	//console.log('room emit', data);
		  	data.id = socket.client.id;
		  	rtc.to(data.room).emit(data.room, data);
		  });

		  socket.on('emit', function (data) {

		  	console.log(data);

		  	//rtc.emit('msg', data); //everyone in RTC chanel will get this, even the socket calling it
		    socket.broadcast.emit('msg', data);

		  });

	});

}