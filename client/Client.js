const CLIENT_SINGLETON = Symbol();
const CLIENT_SINGLETONENFORCER = Symbol();

class Client {
	constructor(Client_singleton){
		if (Client_singleton !== CLIENT_SINGLETONENFORCER) {
      throw new Error('Cannot construct singleton');
    }
		console.log("constructor "+this+"()");
		this.init();
	}
	static get instance() {
    if (!this[CLIENT_SINGLETON]) {
      this[CLIENT_SINGLETON] = new Client(CLIENT_SINGLETONENFORCER);
    }
    return this[CLIENT_SINGLETON];
  }
	init(){
		this.conn = null;
	}
	toString(){
		return this.constructor.name;
	}
	
	connect(url,protocols){
		if(this.conn != null){
			this.conn.close();
		}
		if(!url){
			url = "ws://"+window.location.hostname+":8081";
		}
		this.conn = protocols?new WebSocket(url,new WebSocket(url)):new WebSocket(url);
		this.conn.onopen = this.onopen.bind(this);
		this.conn.onclose = this.onclose.bind(this);
		this.conn.onerror = this.onerror.bind(this);
		this.conn.onmessage = this.onmessage.bind(this);
	}
	
	onopen(event){
		console.log(this+".onopen()");
	}
	onclose(event){
		console.log(this+".onclose()");
	}
	onerror(event){
		console.log(this+".onerror()");
	}
	onmessage(event){
		// var res = JSON.parse(event.data);
		console.log(this+".onmessage("+event.data+")");
	}
	
	send(mo){
		if(this.conn){
			this.conn.send(mo.toJson())
		}else{
			console.error("Not connected");
		}
	}
	close(){
		if(this.conn){
			this.conn.close()
		}
		this.conn = null;
	}
}

// module.exports = Room;

