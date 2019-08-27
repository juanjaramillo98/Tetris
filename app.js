  
var express = require('express');
var app = express();
var path = require('path');
var jugadores = [];

app.set('port', process.env.PORT || 3000)

var serv = app.listen(app.get('port'));

app.get('/',function(req, res) {
	if(jugadores.length < 5 ){
		res.sendFile(path.join(__dirname , 'publico','index.html'));
	}
});
app.use('/publico',express.static(path.join(__dirname , 'publico')));


const socketIO = require('socket.io');
const io = socketIO(serv);



io.on('connection',(socket)=>{
	

	if(jugadores.length < 5){
		jugadores.push([socket.id,[]]); 
	}


	console.log("este perro",socket.id,jugadores.length);

	function update(jugador,index){
		if (socket.id != jugador[0]){
			console.log("que es lo que tranza",jugador[0]);
		}else{
			console.log("yo fui",jugador[0]);
		}
		
	}
	socket.on('update',(data) =>{

		for( var i = 0; i < jugadores.length; i++){ 
			if ( jugadores[i][0] === socket.id) {
			  jugadores[i][1] = data;
			  socket.emit("update",jugadores[i]);
			}
		}
		jugadores.forEach(update);
	});

    socket.on('linea',() =>{
		console.log("apunto",socket.id);
	});

	socket.on('disconnect',()=>{
		for( var i = 0; i < jugadores.length; i++){ 
			if ( jugadores[i][0] === socket.id) {
			  jugadores.splice(i, 1); 
			}
		}
		console.log(socket.id,"este mk se desconecto",jugadores.length);
	});
          
});