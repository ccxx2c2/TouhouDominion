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

Array.prototype.shuffle = function() {
    var input = this;

    for (var i = input.length-1; i >=0; i--) {

        var randomIndex = Math.floor(Math.random()*(i+1));
        var itemAtIndex = input[randomIndex];

        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
};
Array.prototype.remove = function(element) {
    var index = this.indexOf(element);
    if(index == -1){
        return -1;
    }
    else{
      return this.splice(index, 1);
    }
};

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
        .html(data+'<br>')
        .css('color',"#fff"));
    }
    else if (type === 'user'){
        $("#sidebar").append($('<span/>')
        .addClass('username')
        .attr('id', 'username_'+data)
        .html(data+(data === host?" host":"")+'<br>')
        .css('color',data === host?"#00cc00":"#333"));
    }
    else if (type === 'prepare'){
        $("#username_"+data.name).html(data.name+(data.name === host?" host":"")+(data.prepared?" prepared":"")+'<br>')
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
           $("#ynModal").modal("hide");
       }
    /*   else if ($(window).height() < 800){

    }*/
   }
}

socket.on('verified', (data) => {
    if(data.valid){
       $("#loginModal").modal("hide");
       $("#changeRoomModal").modal("hide");
        connected = true;
        host = data.roomhost;
       if(data.page){
            $("body").prepend(data.page);
            regVue(1);
       }
        if(host != username){
            $(".btn.btn-success").attr("disabled","disabled");
            $("#readybutton").removeAttr("disabled");
            $("#readybutton").text("准备");
        }

        $("#room").text(`room#${room} `);
        $("#sidebar").html("<span style='font-weight:bold;'>用户列表：</span><br />");
        for(user in data.users){
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
    $("body").css('background-color',"#a33");
    $(".cards").each(function(i,e){//index,element
        $(this).popover('hide');
    });
    app2.$destroy();
    $('#room_vue_instance').remove();
    $("body").prepend(data.page);
    regVue(2);
    app3.cards = app2.cards;
    app3.username = username;
    console.log("game start");
});



socket.on('user joined',(data) => {
    addMessage(data.username,'user');

});
socket.on('user left', (data) => {
    $(`#username_${data.username}`).remove()
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
        if(event.keyCode == 13 && timeOut == -1){
            app3.nextStage();
            timeOut = 0;
            setTimeout("timeOut = -1",500);
            return;
        }
        keyCode = event.keyCode - 49;
        if(app3.myCardInHand == undefined) return;
        if(keyCode < app3.myCardInHand.length
        && keyCode >= 0){
            app3.use(keyCode);
            return;
        }

        keyCode = QWERTY[0].indexOf(String.fromCharCode(event.keyCode));

        if(keyCode != -1){
            if(keyCode < 5)
                app3.buy(keyCode,'supply');
            if(keyCode > 5 && keyCode < 9)
                app3.buy(keyCode - 6,'basic');
            return;
        }
        keyCode = QWERTY[1].indexOf(String.fromCharCode(event.keyCode));
        if(keyCode != -1){
            if(keyCode < 5)
                app3.buy(keyCode + 5,'supply');
            if(keyCode > 5 && keyCode < 9)
                app3.buy(keyCode - 6 + 3,'basic');
            return;
        }
        keyCode = QWERTY[2].indexOf(String.fromCharCode(event.keyCode));
        if(keyCode != -1){
            if(keyCode > 5 && keyCode < 9)
                app3.buy(keyCode - 6 + 6,'basic');
            return;
        }

    }
});
