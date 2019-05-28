class ExtendedMap extends Map{
	constructor(){
		super();
	}
	
	toJSON(){
    const out = Object.create(null)
    this.forEach((v, k) => {
			if ("toJSON" in v) {
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
