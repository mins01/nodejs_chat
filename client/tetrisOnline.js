"use strict"

var tetrisOnline = {
	"ttrg":null,
	"ttrgs":{},
	"uid":"",
	"createTetris":function(uid){
		if(uid==null || !uid || uid.length<0){return null;}
		if(this.ttrgs[uid]){return this.ttrgs[uid];}
		var gameBox = document.querySelector("#gameboxHtml").content.cloneNode(true).querySelector('.gameBox');
		$(gameBox).attr("data-uid",uid);
		var gameBoxes = document.querySelector(".gameBoxes");

		if(controller.v.user.uid == uid){
			gameBoxes.prepend(gameBox);

		}else{
			gameBoxes.append(gameBox);
		}

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

				info.player = controller.v.user.nick+"_"+controller.v.user.uid;
				info.nick = controller.v.user.nick;
				info.uid = controller.v.user.uid;
				controller.send(new MsgObj({app:"tetris","fun":"draw",val:[map,w,h,mapNext,info]}));
				// tetrisGame.draw(map,w,h,mapNext,info);
			}
			ttrg.ttr.cbOnScore = function(newScore,gap){
				if(gap>0) this.sleep();
				console.log("scoreUP : +"+gap+ " = "+newScore)
			}
			ttrg.ttr.cbOnGameOver = function(newScore,gap){
				if(!this.gaming){
					// tetrisGame.ab.stop().clear().contentHtml('<big>GAMEOVER</big>',-1).show(0)
					return;
				}
				controller.send(new MsgObj({app:"tetris","fun":"gameOver",val:[newScore,gap]}));
			}

			ttrg.cbOnRemoveRows = function(ys,w,map){
				console.log("cbOnRemoveRows ttrg2.beAttacked");

				controller.send(new MsgObj({app:"tetris","fun":"attack",val:[ys.length]}));
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
		ttrg.start();
	},
	"leave":function(uid){
		if(!this.ttrgs[uid]){return false;}
		var ttrg = this.ttrgs[uid];
		ttrg.gameOver();
		delete this.ttrgs[uid];
		$(".gameBox[data-uid='"+uid+"']").remove()
	},
	"jsonHandler":function(json){
		// console.log(json);
		var uid = json.uid;
		var ttrg = this.createTetris(uid);
		switch (json.fun) {
			case "info1st":
			$("#info1st").text(json.val.nick+" : "+json.val.score+"점")
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

			default:
			if(ttrg[json.fun]!=null){
				ttrg[json.fun].apply(ttrg,json.val);
			}
			break;

		}
	}

}
