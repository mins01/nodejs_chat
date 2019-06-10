"use strict"

var tetrisOnline = {
	"ttrgs":{},
	"uid":"",
	"jsonHandler":function(json){
		console.log(json);
		this.createTetris(json.uid);
	},
	"createTetris":function(uid){
		if(this.ttrgs[uid]){return this.ttrgs[uid];}
		var gameBox = document.querySelector("#gameboxHtml").content.cloneNode(true).querySelector('.gameBox');
		$(gameBox).attr("uid",uid);
		var gameBoxes = document.querySelector(".gameBoxes");
		gameBoxes.append(gameBox);
		var ttrg = tetrisBoxGame();
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
		return this.ttrgs[uid];
	}
}