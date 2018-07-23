"use strict";
//CONSTS
const ROOMAMOUNT = 3;
const QWERTY = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
const ENTER = 13; // key code
//variableInApp
//import cardSource from data.js
var socket = io();
var username;
var room = 0;
var connected = false;
var prepared = false;
var host = '';
var addedStage = '';

Array.prototype.shuffle = function(start = 0, end = this.length) {
    let input = this;

    for (let i = end - 1; i >= start; i -= 1) {

        let randomIndex = Math.floor(Math.random()*(i - start + 1)) + start;
        [input[randomIndex], input[i]] = [input[i], input[randomIndex]];
    }
    return input;
};
Array.prototype.remove = function(element) {
    let index = this.indexOf(element);
    if(index === -1){
        return -1;
    }
    else {
      return this.splice(index, 1)[0];
    }
};
 // from https://stackoverflow.com/questions/33355528/filtering-an-array-with-a-function-that-returns-a-promise/46842181#46842181
 Array.prototype.asyncfilter = async function filter(callback) {
    return (await Promise.all(this.map(async item => {
         return (await callback(item)) ? item : undefined
    }))).filter(i=>i!==undefined);
}
function changePlace(a,b,i){//在b中值为i的一项跑到最前
    a = a.concat(a.splice(0,b.indexOf(i)));
    return a;
}
function getRandomColor (){
  return '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6);
}

function addMessage(data,type,type2){
    if(!connected) return;
    if(type === 'announce'){
        $("#announceModal").find(".alert").hide();
        $("#announceModal").modal("show");
        $("#announceModal").find(`.alert.alert-${type2}`).text(data).show();
    }
    else if(type === 'chat'){
        return;
       /* $("#panel").append($('<span class="username"/>')
        .text(data.username)
        .css('color',getRandomColor()))
        .append(' ')
        .append($('<span class="message"/>')
        .text(data.message))
        .append('<br>');*/
    }
    else if (type === 'rep'){
        $("#sidebar").append($('<span/>')
        .addClass('repDetail')
        .html(data + '<br>')
        .css('color',"#fff"));
    }
    else if (type === 'user'){
        $("#sidebar").append($('<span/>')
        .addClass('username')
        .attr('id', 'username_'+data)
        .html(data + (data === host ? " host" : "") + '<br>')
        .css('color', data === host ? "#00cc00" : "#333"));
    }
    else if (type === 'prepare'){
        $("#username_" + data.name).html(data.name
           + (data.name === host ? " host" : "")
           + (data.prepared ? " prepared" : "") + '<br>');
    }
    $("#sidebar")[0].scrollTop = $("#sidebar")[0].scrollHeight;
}

function regVue(val){
   if(val == 1){
        app2.$mount("#room_vue_instance");
   }
   if(val == 2){
       app3.$mount("#room_instance");
       if($(window).height() < 550 || $(window).width() < 750){
           $("#panel")//.css("height","230px")
           .css("width","480px")
           .css("top","-15px");
           $("#sidebar").css("height","180px");
           app3.otherIndex = 20;
       }
   }
}

socket.on('verified', (data) => {
  // global connected,host,username
    if(data.valid){
       $("#loginModal").modal("hide");
       $("#changeRoomModal").modal("hide");
        connected = true;
        host = data.roomhost;
       if(data.page){
            $("body").prepend(data.page);
            regVue(1);
       }
        if(host !== username){
            $("#menubar").find(".btn.btn-success").attr("disabled","disabled");
            $("#menubar").find(".btn.btn-warning").attr("disabled","disabled");
            $("#readybutton").removeAttr("disabled");
            $("#readybutton").text("准备");
        }

        $("#room").text(`room#${room} `);
        $("#sidebar").html("<span style='font-weight:bold;'>用户列表：</span><br />");
        for(let user of data.users){
            addMessage(user,'user');
        }
    }
    else{
        if(data.errorcode === 1){
            if(data.from === 'new'){
                $("#loginModal").find(".alert.alert-danger").text("房间不合法！").show();
            }
            else{
                $("#changeRoomModal").find(".alert.alert-danger").text("房间不合法！").show();
            }
            return;
        }
        if(data.errorcode === 2){
            $("#loginModal").find(".alert.alert-danger").text("用户名或密码错误！").show();
            return;
        }
    }
});

socket.on('startGame', (data) => {
  // global username
    $("body").css('background-color',"#a33");
    app2.$destroy();
    $('#room_vue_instance').remove();
    $("body").prepend(data.page);
    regVue(2);
    app3.supply = data.supply;
    app3.basic = data.basic;
    app3.username = username;
});

socket.on('user joined',(data) => {
    addMessage(data.username,'user');
});

socket.on('user left', (data) => {
    if($("#room_instance").length > 0){
      addMessage(`用户${data.username}掉出了游戏，游戏结束。`,'announce','warning');
    }
    else {
      $(`#username_${data.username}`).remove();
    }
});

socket.on('disconnect', (data) => {
    addMessage('You are disconnected','announce','danger');
});

var timeOut = -1;
$("body").on('keyup',function(event){
    if($("#room_vue_instance").length>0){
        if(event.keyCode == 13){
            ready();
        }
    }
    else if($("#room_instance").length>0){
        // enter
        if(event.keyCode === ENTER && timeOut === -1){
            app3.nextStage();
            timeOut = 0;
            setTimeout(() => { timeOut = -1; },500);
            return;
        }

        // 1 ~ 0 in mianboard
        let keyCode = event.keyCode - 49;
        if(app3.myHand === undefined) return;
        if(keyCode < app3.myHand.length
        && keyCode >= 0){
            app3.use(keyCode);
            return;
        }

        for(let i = 0; i < 3; i += 1){
            let keyCode = QWERTY[i].indexOf(String.fromCharCode(event.keyCode));
            if(keyCode === -1){
                continue;
            }

            if(keyCode < 5){
                app3.buy(keyCode + 5 * i, 'supply');
            }

            if(keyCode > 5 && keyCode < 9){
                app3.buy(keyCode - 6 + 3 * i,'basic');
            }
            break;
        }
    }
});
