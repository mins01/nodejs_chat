"use strict"

var tetrisOnline = {
	"ttrg":null,
	"ttrgs":{},
	"uid":"",
	"createTetris":function(uid){
		if(this.ttrgs[uid]){return this.ttrgs[uid];}
		var gameBox = document.querySelector("#gameboxHtml").content.cloneNode(true).querySelector('.gameBox');
		$(gameBox).attr("uid",uid);
		var gameBoxes = document.querySelector(".gameBoxes");
		gameBoxes.append(gameBox);
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
			this.ttrg = ttrg;
			ttrg.ttr.cbOnDraw = function(map,w,h,mapNext,info){
				tetrisGame.draw(map,w,h,mapNext,info);
				controller.send(new MsgObj({app:"tetris","fun":"draw",val:[map,w,h,mapNext,info]}));
			}
			// this.start();
		}else{
			ttrg.startClient();
		}
		
		
		return this.ttrgs[uid];
	},
	"start":function(){
		var ttrg = this.createTetris(controller.v.user.uid)
		ttrg.start();
	},
	"jsonHandler":function(json){
		// console.log(json);
		var uid = json.uid;
		var ttrg = this.createTetris(uid);
		switch (json.fun) {
			case "xxx":
				
				break;
			default:
			if(ttrg[json.fun]!=null){
				ttrg[json.fun].apply(ttrg,json.val);
			}
			break;
				
		}
	}
	
}