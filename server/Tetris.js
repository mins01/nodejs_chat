const MsgObj = require("./MsgObj.js");

class Tetris{
	constructor(){
		this.info = {
			"score":0,
			"uid":"",
			"nick":"#NONE#",
		}
		console.log("Tetris()");
	}

	toString(){
		return "Tetris";
	}
	reqHandler(user,mo,room){
		var r;
		switch (mo.fun) {
			case "draw":
			if(mo.val[4].score > this.info.score){
				this.info = mo.val[4];
				room.broadcast((new MsgObj({"app":"tetris","fun":"info1st","val":this.info})));
			}
			room.broadcast(mo);
			break;
			case "first":
			room.broadcast((new MsgObj({"app":"tetris","fun":"info1st","val":this.info})));
			break;
			default:
			room.broadcast(mo);

		}

	}


}


module.exports = Tetris;
