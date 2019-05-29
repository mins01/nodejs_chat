let controller = (function(){
	let controller = {
		"init":function(client){
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
			this.client = client;
			this.client.onmessage = this.resHandler.bind(this);
			this.client.connect();
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
				case "whisper":
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
		"send":function(mo){
			if(mo.rid==null) mo.rid = this.v.room.rid;
			this.client.send(mo);
		},
		"sendFromForm":function(f){
			var mo = new MsgObj();
			mo.cmd = f.cmd.value
			mo.val = f.val.value
			this.send(mo);
		},
		"formMsgOnSubmit":function(f){
			var mo = new MsgObj();
			mo.cmd = "talk";
			mo.val = f.msg.value;
			f.msg.value="";
			if(!mo.val.trim().length){
				return;
			}
			this.send(mo);
			
		},
		"openModalSetting":function(){
			$("#nick_val").val(this.v.user.nick)
			$('#modalSetting').modal('show')
		},
		"hideModalSetting":function(){
			$('#modalSetting').modal('hide')
			$('#input_msg').focus();
		}
		
	}
	
	return controller;
})()