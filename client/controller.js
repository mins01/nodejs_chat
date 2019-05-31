"use strict";
let controller = (function(){
	let controller = {
		"init":function(client){

			this.v = new Vue({
				el: '#chatApp',
				data: {
					// "msgs":[],
					"room":{"subject":"-","users":{}},
					"roomManager":{"rooms":{}},
					"user":{"nick":"##","uid":""},
				},
				// updated:function(){
				// 	var thisC = this;
				// 	$(".msgs .scroll-y").scrollTop($(".msgs .scroll-y").height()+9999999)
				// }
			})
			var thisC = this;
			this.maxMsgCount = 1000;
			this.template_msg = document.getElementById('template_msg');
			this.msgsBox = document.getElementById('msgsBox');
			$("#input_msg").on("keyup",function(event){
				if(event.key=="ArrowUp"){
					if(this.preValue!=null){
						this.value = this.preValue;
					}
				}
			})

			this.msgsBox.addEventListener("DOMNodeInserted", function () {
				var $t = $(".msgs .scroll-y");
				if($t.prop("scrollHeight") - $t.height() - $t.scrollTop()<(50*3)){
					$t.scrollTop($("#msgsBox").height())
				}
			}, false);

			document.title = "CHATTING";
			document.addEventListener('visibilitychange',function(){
				if(document.visibilityState=='visible'){
					thisC.noReadMsgCount = 0;
					document.title = "CHATTING";
				}
			},false)

			this.client = client;
			this.client.onopen = this.onopen.bind(this);
			this.client.onclose = this.onclose.bind(this);
			this.client.onerror = this.onerror.bind(this);
			this.client.onmessage = this.onmessage.bind(this);
			this.client.connect();
			this.reconnect.retry = 5;
			this.reconnect.tm = null;

			if(this.getLS("uuid")==null){
				this.setLS("uuid",uuidgen());
			}


		},
		"toString":function(){
			return "controller";
		},
		"reconnect":function(){
			var thisC = this;
			if(this.reconnect.tm!=null){return;}
			this.msgHandler({"app":"msg","fun":"system","val":"Retry connect : Start ","nick":"#CLIENT#"});
			this.reconnect.tm = setInterval(function(){
				if(thisC.reconnect.retry <= 0){
					thisC.msgHandler({"app":"msg","fun":"system","val":"Retry connect : Fail ","nick":"#CLIENT#"});
					if(thisC.reconnect.tm){clearInterval(thisC.reconnect.tm);}
					return;
				}
				thisC.msgHandler({"app":"msg","fun":"system","val":"Retry connect : remain "+thisC.reconnect.retry,"nick":"#CLIENT#"});
				thisC.client.connect();

				thisC.reconnect.retry--;

			},5000)

		},
		"onopen":function(event){
			console.log(this+".onopen()",event);
			var json = {"app":"msg","fun":"notice","val":"Connection success","nick":"#CLIENT#"}
			this.pushMsg(json)
			//-- 닉네임 자동 설정
			var nick = this.getLS('nick');
			var uuid = this.getLS('uuid');
			var mo = new MsgObj({"app":"first","fun":"","val":""});
			if(nick){
				mo.nick = nick;
			}
			if(uuid){
				mo.uuid = uuid;
			}
			this.send(mo);
			//-- 재접속 관련
			this.reconnect.retry = 5;
			if(this.reconnect.tm){clearInterval(this.reconnect.tm);}
		},
		"onclose":function(event){
			console.log(this+".onclose()",event);
			var json = {"app":"msg","fun":"notice","val":"Connection closed","nick":"#CLIENT#"}
			this.pushMsg(json)
			this.reconnect();
		},
		"onerror":function(event){
			console.log(this+".onerror()",event);
			var json = {"app":"msg","fun":"notice","val":"Error","nick":"#CLIENT#"}
			this.pushMsg(json)
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
		"syncRoomManager":function(){
			this.send((new MsgObj({"app":"roomManager","fun":"sync","val":""})));
		},
		"roomManagerHandler":function(json){
			switch (json.fun) {
				case "create":
				this.msgHandler({"app":"msg","fun":"system","val":"Room("+json.val+") was created."});
				this.join(json.val)

				break;
				case "sync":
				this.v.roomManager = json.val;
				// $("#roomManager_rid_val").val(this.v.room.rid);
				break;
				default:
			}
		},
		"roomHandler":function(json){
			this.v.room = json.val
			// $("#roomManager_rid_val").val(this.v.room.rid);
			if(	$('#modalRoomManager').hasClass("show")){
				$("#roomManager_create_val").val("");
				// $("#roomManager_rid_val").val(this.v.room.rid);
				this.syncRoomManager();
			}
		},
		"userHandler":function(json){
			this.v.user = json.val;
			this.setLS('nick',this.v.user.nick);
		},
		"msgHandler":function(json){
			if(!json.nick){
				json.nick = json.fun;
			}
			this.pushMsg(json);
		},
		"talkHandler":function(json){
			console.error("X");
		},
		"errorHandler":function(json){
			json.nick = json.app;
			this.pushMsg(json);
			this.client.close();
		},
		"noticeHandler":function(json){
			console.error("X");
		},
		"whisperHandler":function(json){
			console.error("X");
		},


		"noReadMsgCount":0,
		"pushMsg":function(json){
			if($(this.msgsBox).find('li').length > this.maxMsgCount){
				$(this.msgsBox).find('li:first').remove();
			}
			this.appendMsg(json)
			if(document.hidden){
				this.noReadMsgCount++;
				document.title=(this.noReadMsgCount%2?"✉️":"📨")+"Unread : "+this.noReadMsgCount;
			}

		},
		"appendMsg":function(json){
			var t = this.template_msg.content.cloneNode(true);
			$(t).find('li.msg').attr('data-app',json.app).attr('data-fun',json.fun).attr('data-val',json.val);
			$(t).find('.nick').text(json.nick);
			$(t).find('.val').text(json.val).autolink();
			$(this.msgsBox).append(t);
		},
		"send":function(mo){
			if(mo.rid==null) mo.rid = this.v.room.rid;
			this.client.send(mo);
			console.log("send("+mo+")");
		},
		"join":function(rid){
			if(this.v.room.rid==rid){return false;}
			this.send((new MsgObj({"app":"roomManager","fun":"leaveAndJoin","val":this.v.room.rid,"rid":rid})));
			// this.send((new MsgObj({"app":"roomManager","fun":"leave","val":this.v.room.rid})));
			// this.send((new MsgObj({"app":"roomManager","fun":"join","val":rid})));
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
			f.val.preValue = f.val.value;
			setTimeout(function(){
				f.val.value = "";
			},0)
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
			// $("#roomManager_rid_val").val(this.v.room.rid);
			$("#roomManager_create_val").val("");
			$('#modalRoomManager').modal('show')
		},
		"hideModalRoomManager":function(){
			$('#modalRoomManager').modal('hide')
			$('#input_msg').focus();
		},
		"getLS":function(key){
			key = "nodejs_chat_"+key;
			return localStorage.getItem(key)
		}
		,
		"setLS":function(key,val){
			key = "nodejs_chat_"+key;
			return localStorage.setItem(key,val);
		}

	}

	return controller;
})()
