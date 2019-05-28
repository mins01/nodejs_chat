"use strict";

class MsgObj {
	constructor(obj){
		if(obj){
			for(var x in obj){
				this[x] = obj[x];
			}
		}
	}
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

module.exports = MsgObj;

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