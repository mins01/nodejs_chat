"use strict";
class ExtendedSet extends Set{
	constructor(){
		super();
	}

	toJSON(){
    const out = [];
    this.forEach((v) => {
			if (typeof v.toJSON == "function") {
        out.push(v.toJSON());
      }else {
        out.push(v);
      }
    })
    return out
	}
}


module.exports = ExtendedSet;
