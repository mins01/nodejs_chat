"use strict";

class MsgObj {
	toString(){
		return this.toJson();
	}
	toJson(){
		return JSON.stringify(this);
	}
	clear(){
		for(var x in this){
			delete this[x];
		}		
	}
}
try{
	module.exports = MsgObj;	
}catch(e){
	
}


// 
// var mo = new MsgObj()
// mo.x = '1';
// console.log(mo);
// for(var x in mo){
// 	console.log(x);
// }
// console.log('clear');
// mo.clear();
// mo.y = '1';
// for(var x in mo){
// 	console.log(x);
// }