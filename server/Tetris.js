class Tetris{
	constructor(){
		console.log("Tetris()");
	}

	toString(){
		return "Tetris";
	}
	
	reqHandler(user,mo,room){
		var r;
		room.broadcast(mo);
	}


}


module.exports = Tetris;
