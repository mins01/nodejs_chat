const MsgObj = require("./MsgObj.js");

class Tetris{
	constructor(){
		this.info = {
			"score":0,
			"uid":"",
			"nick":"#NONE#",
		}
		this.infos = {}
		console.log("Tetris()");
	}

	toString(){
		return "Tetris";
	}
	
	getRanks(info){
		var nowTime = (new Date()).getTime();
		var limitTime = nowTime - 10*1000;
		if(info != null){
			info.time = nowTime;
			this.infos[info.uid] = info;
		}
		var ranks = []
		for(let x in this.infos){
			if(this.infos[x].time < limitTime){
				this.infos[x] = null;
				delete this.infos[x];
			}else{
					ranks.push(this.infos[x])
			}	
		}
		

		ranks.sort(function(a,b){
			return a.score < b.score
		})
		return ranks;
	}
	
	reqHandler(user,mo,room){
		var r;
		switch (mo.fun) {
			case "draw":
			if(mo.val[4].score > this.info.score){
				this.info = mo.val[4];
				room.broadcast((new MsgObj({"app":"tetris","fun":"info1st","val":this.info})));
			}
			room.broadcast([
				mo,
				// (new MsgObj({"app":"tetris","fun":"ranks","val":this.getRanks(mo.val[4])})),
			]);
			break;
			case "first":
			room.broadcast([
				(new MsgObj({"app":"tetris","fun":"info1st","val":this.info})),
				// (new MsgObj({"app":"tetris","fun":"ranks","val":this.getRanks(null)})),
			]);
			break;
			default:
			room.broadcast(mo);

		}

	}


}


module.exports = Tetris;
