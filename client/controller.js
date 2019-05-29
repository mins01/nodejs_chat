let controller = (function(){
	let controller = {
		"init":function(client){
			this.v = new Vue({
				el: '#chatApp',
				data: {
					"msgs":[],
					"room":{"subject":"-","users":{}},
					"user":{"nick":"##","uid":""},
				},
				updated:function(){
					var thisC = this;
					$(".msgs .scroll-y").scrollTop($(".msgs .scroll-y").height()+9999999)
					
					// $(document.body).attr("data-is-admin",$("#chatApp").attr("data-is-admin"));
				}
			})
			this.client = client;
			this.client.onopen = this.onopen.bind(this);
			this.client.onclose = this.onclose.bind(this);
			this.client.onerror = this.onerror.bind(this);
			this.client.onmessage = this.onmessage.bind(this);
			this.client.connect();
		},
		"toString":function(){
			return "controller";
		},
		"onopen":function(event){
			console.log(this+".onopen()",event);
			var json = {"cmd":"notice","val":"Connection success","nick":"#CLIENT#"}
			this.v.msgs.push(json)
		},
		"onclose":function(event){
			console.log(this+".onclose()",event);
			var json = {"cmd":"notice","val":"Connection closed","nick":"#CLIENT#"}
			this.v.msgs.push(json)
		},
		"onerror":function(event){
			console.log(this+".onerror()",event);
			var json = {"cmd":"notice","val":"Error","nick":"#CLIENT#"}
			this.v.msgs.push(json)
		},
		"onmessage" :function(event){
			try {
				this.jsonHandler(JSON.parse(event.data));	
			} catch (e) {
				console.error(e);
			} finally {
				
			}
		},

		"jsonHandler" :function(json){
			switch (json.cmd) {
				case "error":this.errorHandler(json);break;
				case "notice":this.noticeHandler(json);break;
				case "whisper":this.whisperHandler(json);break;
				case "talk":this.talkHandler(json);break;
				case "room":this.roomHandler(json);break;
				case "user":this.userHandler(json);break;
				default:
				
			}
		},
		"roomHandler":function(json){
			this.v.room = json.val
		},
		"userHandler":function(json){
			this.v.user = json.val;
		},
		"talkHandler":function(json){
			this.pushMsgs(json);
		},
		"errorHandler":function(json){
			json.nick = json.cmd;
			this.pushMsgs(json);
			this.client.close();
		},
		"noticeHandler":function(json){
			json.nick = json.cmd;
			this.pushMsgs(json);
		},
		"whisperHandler":function(json){
			this.pushMsgs(json);
		},
		"pushMsgs":function(json){
			if(this.v.msgs.length>100){
				this.v.msgs.shift()
			}
			this.v.msgs.push(json)
		},
		"send":function(mo){
			if(mo.rid==null) mo.rid = this.v.room.rid;
			this.client.send(mo);
		},
		"sendFromForm":function(f){
			var mo = new MsgObj();
			mo.cmd = f.cmd.value
			mo.val = "";
			if(f.val){
				mo.val = f.val.value
			}
			if(f.act){
				mo.act = f.act.value
			}
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
			$("#room_admin_val").val("")
			$('#modalSetting').modal('show')
		},
		"hideModalSetting":function(){
			$('#modalSetting').modal('hide')
			$('#input_msg').focus();
		},
		
		"openModalAdmin":function(){
			$('#modalAdmin').modal('show')
		},
		"hideModalAdmin":function(){
			$('#modalAdmin').modal('hide')
			$('#input_msg').focus();
		}
		
	}
	
	return controller;
})()