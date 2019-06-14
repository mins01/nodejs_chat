const MsgObj = require("./MsgObj.js");

class Tetris{
	constructor(){
		this.info = {
			"score":0,
			"uid":"",
			"nick":"#NONE#",
		}
		this.highInfos = []
		console.log("Tetris()");
	}

	toString(){
		return "Tetris";
	}
	gameOver(info){
		var highInfos = this.highInfos.splice(0);
		highInfos.push(info);
		highInfos.sort(function(a,b){
			return b.score - a.score
		})
		this.highInfos = highInfos.splice(0,10);
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
			room.broadcast([
				(new MsgObj({"app":"tetris","fun":"info1st","val":this.info})),
				(new MsgObj({"app":"tetris","fun":"syncHighInfo","val":[this.highInfos]})),
			]);
			break;
			case "gameOver":
				this.gameOver(mo.val[0]);
				room.broadcast([
					(new MsgObj({"app":"tetris","fun":"gameOver","val":mo.val,"uid":mo.uid})),
					(new MsgObj({"app":"tetris","fun":"syncHighInfo","val":[this.highInfos]})),
				]);
			break;
			default:
			room.broadcast(mo);

		}

	}


}


module.exports = Tetris;
