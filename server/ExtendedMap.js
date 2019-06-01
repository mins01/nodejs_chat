"use strict";
class ExtendedMap extends Map{
	constructor(){
		super();
	}

	toJSON(){
    const out = Object.create(null)
    this.forEach((v, k) => {
			if (typeof v.toJSON == "function") {
        out[k] = v.toJSON();
      }else if (v instanceof ExtendedMap) {
        out[k] = v.toJSON();
      }
      else {
        out[k] = v
      }
    })
    return out
	}
}


module.exports = ExtendedMap;
