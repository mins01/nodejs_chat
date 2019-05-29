let controller = (function(){
	let controller = {
		"init":function(){
			this.v = new Vue({
				el: '#chatApp',
				data: {
					"msgs":[],
					"room":{"subject":"-","users":{}},
					"user":{"nick":"##"},
				},
				updated:function(){
					var thisC = this;
					$(".msgs .scroll-y").scrollTop($(".msgs .scroll-y").height()+9999999)
				}
				
			})
		},
		"resHandler" :function(event){
			try {
				this.jsonHandler(JSON.parse(event.data));	
			} catch (e) {
				console.error(e);
			} finally {
				
			}
			
		},
		"jsonHandler" :function(json){
			switch (json.cmd) {
				case "error":
				case "notice":
					json.nick = json.cmd;
				case "talk":
					if(this.v.msgs.length>100){
						this.v.msgs.shift()
					}
					this.v.msgs.push(json)
				break;
				case "room":
					this.v.room = json.val
				break;
				case "user":
					this.v.user = json.val;
				break;
				
				default:
				
			}
		},
		"roomHandler":function(json){
			
		},
		"userHandler":function(json){
			
		},
		"talkHandler":function(json){
			
		},
		"errorHandler":function(json){
			
		},
		"noticeHandler":function(json){
			
		},
		"onsubmit":function(f){
			var mo = new MsgObj();
			mo.cmd = "talk";
			mo.rid = "robby";
			mo.val = f.msg.value;
			f.msg.value="";
			if(!mo.val.trim().length){
				return;
			}
			cl.send(mo);
		}
	}
	
	return controller;
})()