"use strict"

var tetrisOnline = {
	"ttrg":null,
	"ttrgs":{},
	"uid":"",
	"isOnline":false,
	"isReady":false,
	"createTetris":function(uid){
		if(uid==null || !uid || uid.length<0){return null;}
		if(this.ttrgs[uid]){return this.ttrgs[uid];}
		var gameBox = document.querySelector("#gameboxHtml").content.cloneNode(true).querySelector('.gameBox');
		$(gameBox).attr("data-uid",uid);

		if(controller.v.user.uid == uid){
			var gameBoxes = document.querySelector("#gameBoxes-I");
			gameBoxes.append(gameBox);

		}else{
			if(document.querySelectorAll("#gameBoxes-L .gameBox").length <= document.querySelectorAll("#gameBoxes-R .gameBox").length){
				var gameBoxes = document.querySelector("#gameBoxes-L");
			}else{
				var gameBoxes = document.querySelector("#gameBoxes-R");
			}
			gameBoxes.append(gameBox);
		}
		var thisC = this;
		var ttrg = tetrisBoxGame();
		var tetrisGame = ttrg;
		ttrg.title="p1";
		ttrg.init(gameBox.querySelector('.ttrbg-layout'));
		ttrg.create(10,20);
		$(document).on('keydown',function(event){
			ttrg.onkeyDown(event)
		})
		$(window).on('resize',function(event){
			ttrg.onresize();
		})
		this.ttrgs[uid]=ttrg;
		if(controller.v.user.uid == uid){
			$(gameBox).attr("data-is-mine","1");
			this.ttrg = ttrg;
			ttrg.ttr.cbOnDraw = function(map,w,h,mapNext,info){

				info.player = controller.v.user.nick;
				info.nick = controller.v.user.nick;
				info.uid = controller.v.user.uid;
				info.isOnline = thisC.isOnline;
				controller.send(new MsgObj({app:"tetris","fun":"draw",val:[map,w,h,mapNext,info]}));
				// tetrisGame.draw(map,w,h,mapNext,info);
			}
			ttrg.ttr.cbOnScore = function(newScore,gap){
				if(gap>0) this.sleep();
				console.log("scoreUP : +"+gap+ " = "+newScore)
			}
			ttrg.ttr.cbOnGameOver = function(info){
				// alert('x')
				// if(!this.gaming){
				// 	// tetrisGame.ab.stop().clear().contentHtml('<big>GAMEOVER</big>',-1).show(0)
				// 	return;
				// }

				info.player = controller.v.user.nick;
				info.nick = controller.v.user.nick;
				info.uid = controller.v.user.uid;
				controller.send(new MsgObj({app:"tetris","fun":"gameOver",val:[info]}));
				if(thisC.isOnline){
						controller.send(new MsgObj({app:"tetris","fun":"onlineGameOver",val:[info]}));
				}else{
					
				}
			}

			ttrg.cbOnRemoveRows = function(ys,w,map){
				
				if(ys.length>1){ // 1초과만 어택!
					console.log("cbOnRemoveRows Attack");
					controller.send(new MsgObj({app:"tetris","fun":"attack",val:[ys.length]}));	
				}
			}
		}else{
			$(gameBox).attr("data-is-mine","0");
			ttrg.startClient();
		}
		ttrg.onresize();


		return this.ttrgs[uid];
	},
	"start":function(){
		controller.send(new MsgObj({app:"tetris","fun":"first",val:[]}));
		var ttrg = this.createTetris(controller.v.user.uid)
		// ttrg.start();
		ttrg.startSimple();
		this.isOnline = false;
		this.isReady = false;
	},
	"btnOnlineStart":function(){
		this.isReady = true;
		controller.send(new MsgObj({app:"tetris","fun":"onlineStart",val:[]}));
	},
	"onlineStart":function(){
		if(this.isReady){
			console.log("onlineStart");
			this.start();
			this.isOnline = true;	
		}
		
	},
	"btnOnlineReady":function(){
		var ttrg = this.createTetris(controller.v.user.uid)
		ttrg.ttr.gameOver()
		this.isReady = true;
		ttrg.ttr.draw();
		ttrg.ab.contentText("Online Ready");
		
	},
	"countOnlineGaming":function(){
		let cnt = 0;
		for(let x in this.ttrgs){
			let ttrg = this.ttrgs[x];
			if(ttrg.info && ttrg.info.isOnline && ttrg.info.gaming){
					cnt++;
			}
		}
		return cnt;
	},
	"onlineGameOver":function(ttrg,json){
		if(this.isOnline){
			if(this.countOnlineGaming()==1 && controller.v.user.uid != json.uid){
				this.ttrg.stop();
				console.log("WIN");
			}
		}
	},
	"leave":function(uid){
		if(!this.ttrgs[uid]){return false;}
		var ttrg = this.ttrgs[uid];
		ttrg.gameOver();
		delete this.ttrgs[uid];
		$(".gameBox[data-uid='"+uid+"']").remove()
	},
	"destroy":function(){
		if(this.ttrg) this.ttrg.stop();
		this.ttrgs = {}
		$(".gameBox[data-uid]").remove()
		
	},
	"syncHighInfo":function(highInfos){
		$("#olHigh10 li").each(function(k,v){
			if(!highInfos[k]){
				this.innerText = "#NONE#"
			}else{
				this.innerText = "["+highInfos[k].score +"] "+highInfos[k].player;
			}
		})
	},
	"syncRanks":function(){
		var ranks = [];
		for(let x in this.ttrgs){
			let ttrg = this.ttrgs[x];
			// if(ttrg.info.gaming){
			// 	ranks.push(ttrg.info);	
			// }
			if(ttrg.info && ttrg.info.isOnline){
				ranks.push(ttrg.info);	
			}
			
		}
		
		ranks.sort(function(a,b){
			return b.score - a.score
		})
		// console.log(ranks)
		$("#olRank10 li").each(function(k,v){
			if(!ranks[k]){
				this.innerText = "#NONE#"
			}else{
				this.innerText = "["+ranks[k].score +"] "+ranks[k].player;
			}
		})
	},
	"jsonHandler":function(json){
		// console.log(json);
		var uid = json.uid;
		var ttrg = this.createTetris(uid);
		switch (json.fun) {
			case "info1st":
			$("#info1st").text(json.val.nick+"("+json.val.score+")")
			break;
			case "join":
			if(controller.v.user.uid == json.val){
				// console.log("초기화")
				this.destroy();
			}
			break;
			case "leave":
			this.leave(json.val)
			break;
			case "attack":
			if(controller.v.user.uid != uid && this.ttrg){
				this.ttrg.beAttacked.apply(ttrg,json.val);
				console.log(json);
			}
			break;
			case "draw":
				ttrg[json.fun].apply(ttrg,json.val);
				this.ttrgs[uid].info = json.val[4];
				this.syncRanks();
			break;
			case "gameOver":
				// this.gameOver(ttrg,json.val);
			break;
			
			case "syncHighInfo":
				this.syncHighInfo(json.val[0]);
			break;
			case "onlineStart":
				this.onlineStart(json.val);
			break;
			case "onlineGameOver":
				this.onlineGameOver(ttrg,json);
			break;

			default:
			if(ttrg[json.fun]!=null){
				ttrg[json.fun].apply(ttrg,json.val);
			}
			break;

		}
	}

}
