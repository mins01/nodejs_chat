let controller = (function(){
	let controller = {
		"init":function(client){
			this.v = new Vue({
				el: '#chatApp',
				data: {
					"msgs":[],
					"room":{"subject":"-","users":{}},
					"roomManager":{"rooms":{}},
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
			var json = {"app":"msg","fun":"notice","val":"Connection success","nick":"#CLIENT#"}
			this.v.msgs.push(json)
		},
		"onclose":function(event){
			console.log(this+".onclose()",event);
			var json = {"app":"msg","fun":"notice","val":"Connection closed","nick":"#CLIENT#"}
			this.v.msgs.push(json)
		},
		"onerror":function(event){
			console.log(this+".onerror()",event);
			var json = {"app":"msg","fun":"notice","val":"Error","nick":"#CLIENT#"}
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
			switch (json.app) {
				case "error":this.errorHandler(json);break;
				case "notice":this.noticeHandler(json);break;
				case "whisper":this.whisperHandler(json);break;
				case "msg":this.msgHandler(json);break;
				case "talk":this.talkHandler(json);break;
				case "room":this.roomHandler(json);break;
				case "roomManager":this.roomManagerHandler(json);break;
				case "user":this.userHandler(json);break;
				default:
			}
		},
		"roomManagerHandler":function(json){
			switch (json.fun) {
				case "create":
				this.msgHandler({"app":"msg","fun":"notice","val":"Created room","nick":"#CLIENT#"});
				this.join(json.val)
				break;
				case "sync":
				this.v.roomManager = json.val;
				break;
				default:
					
			}
		},
		"roomHandler":function(json){
			this.v.room = json.val
		},
		"userHandler":function(json){
			this.v.user = json.val;
		},
		"msgHandler":function(json){
			if(!json.nick){
				json.nick = json.fun;
			}
			this.pushMsgs(json);
		},
		"talkHandler":function(json){
			console.error("X");
		},
		"errorHandler":function(json){
			json.nick = json.app;
			this.pushMsgs(json);
			this.client.close();
		},
		"noticeHandler":function(json){
			console.error("X");
		},
		"whisperHandler":function(json){
			console.error("X");
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
			console.log("send("+mo+")");
		},
		"join":function(rid){
			if(this.v.room.rid==rid){return false;}
			this.send((new MsgObj({"app":"roomManager","fun":"leave","val":this.v.room.rid})));
			this.send((new MsgObj({"app":"roomManager","fun":"join","val":rid})));
		},	
		"sendFromForm":function(f){

			var mo = new MsgObj();
			mo.app = f.app.value
			mo.val = "";
			if(f.val){
				mo.val = f.val.value
			}
			if(f.fun){
				mo.fun = f.fun.value
			}
			this.send(mo);
		},
		"formMsgOnSubmit":function(f){
			if(!f.val.value.trim().length){
				return;
			}
			this.sendFromForm(f);
			f.val.value = "";
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

		"openModalRoom":function(){
			$("#room_setSubject_val").val(this.v.room.subject)
			$("#room_setMaxUserCount_val").val(this.v.room.maxUserCount)

			$('#modalRoom').modal('show')
		},
		"hideModalRoom":function(){
			$('#modalRoom').modal('hide')
			$('#input_msg').focus();
		},
		"openModalRoomManager":function(){
			this.send((new MsgObj({"app":"roomManager","fun":"sync","val":""})));
			$("#roomManager_rid_val").val(this.v.room.rid);
			$('#modalRoomManager').modal('show')
		},
		"hideModalRoomManager":function(){
			$('#modalRoomManager').modal('hide')
			$('#input_msg').focus();
		}

	}

	return controller;
})()
