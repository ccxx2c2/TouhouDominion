//init page
$("#loginModal").modal("show");
const ROOMAMOUNT = 3;

//variables
var socket = io();
var username;
var password;
var room;
//import cardsource from data.js
var connected = false;
var prepared = false;
var host = '';
var app1;
Array.prototype.shuffle = function() {
    var input = this;

    for (var i = input.length-1; i >=0; i--) {

        var randomIndex = Math.floor(Math.random()*(i+1));
        var itemAtIndex = input[randomIndex];

        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
}
var app2 = new Vue({
    data:{
        cards:[],
        noin:[[],[],[26,27,28,29,30],[],[19,20,21],[],[1,2,3,4,5,6,7]],
        cardArray:[],
        language:0,
        lim:10,
        binded:0,
    },
    created:function(){
    },
    methods:{
        generate:function(limit){
            if(host != username) return;
            socket.emit('generateCard',{
                limit: limit
            });
        },
        generateAvailable:function(limit){
            if(host != username) return;
            socket.emit('generateCard',{
                limit: limit,
                type:'available'
            });
        },
        change:function(index){
            if(host != username) return;
            limit = $(".cards").length;
            socket.emit('generateCard',{
                limit: limit,
                index: index
            });
        },
        name:function(card){
            switch(this.language){
                case 0:return card.chname;
                case 1:return card.janame;
                case 2:return card.enname;
            }
        },
        filename:function(card){
            var t="00"+card.number;
            return './pic/'+card.expansion+'/'+card.expansion+t.slice(t.length-3,t.length)+'.jpg';
        },
        title:function(card){
            var str=card.type;
            if(card.type2!=='') str+='-'+card.type2;
            if(card.type3!=='') str+='-'+card.type3;
            str+=' '+card.expansion;
            str+=' '+card.cost;
            return this.name(card)+' '+str;
        },
        description:function(card){
            switch(this.language){
                case 0:return card.cheffect+'\n————————\n'+card.chspecial;
                case 1:return card.jaeffect+'\n————————\n'+card.jaspecial;
                case 2:return card.eneffect+'\n————————\n'+card.enspecial;
            }
        },
        bind:function(){
            //functions for bootstrap
            if(this.binded>=$(".cards").length) return;
            console.log($(".cards").length);
                $(".cards").each(function(i,e){//index,element
                    $(this).popover({
                    });
                });
            this.binded=$(".cards").length;
        },
    },
    updated:function(){
        this.bind();
    },
    mounted:function(){
        if(host!=username){
            console.log(host+' '+username);
            $(".btn.btn-success").attr("disabled","disabled");
        }
        else{
            $("#readybutton").text("开始");
            $("#readybutton").attr("disabled","disabled");
        }

    }
});

var app3 = new Vue({
    data:{
        basicCards:cardsource[6],
        basicCardsAmount:[80,50,50,12,12,12,80],
        cards:[],
        cardsAmount:[12,12,12,12,12,12,12,12,12,12],
        cardArray:[],
        lens:[],//lengths of each expansions
        language:0,
        binded:0,
        username:username,
        myCard:[],
        myCardInHand:[],
        myDrop:[],
        myPoint:0,
        cardInAction:[],
        nowMoney:0,
        nowBuy:0,
        nowAction:0,
        nowCard:0,
        nowStage:'Action',
        otherName:[],
        otherCard:[],
        otherDrop:[],
        otherPoint:[3,3,3,3,3],
        trash:[],
        nowPlayer:"",
        otherIndex:10,
        modal_title:'',
        modal_content:'',
    },
    created:function(){
    },
    methods:{
        name:app2.name,
        filename:app2.filename,
        title:app2.title,
        description:app2.description,
        bind:function(){
            //functions for bootstrap
            if(this.binded>=$(".cards").length) return;
            console.log($(".cards").length);
                $(".cards").each(function(i,e){//index,element
                    $(this).popover({
                    });
                });
            this.binded=$(".cards").length;
        },
        use:(index)=>{
            if(app3.nowPlayer == username)
                socket.emit('useCard',index);
        },
        buy:(index,src) =>{
            if(src == 'basic') index += $(".cards").length;
            if(app3.nowPlayer == username)
                socket.emit('buyCard',index);
        },
        nextStage: ()=>{
            if(app3.nowPlayer == username)
                socket.emit('nextStage');
        },
        log:console.log
    },
    updated:function(){
        this.bind();
    },
});

function regVue(val){
   if(val == 1){
        app2.$mount("#menubar");
   }
   if(val == 2){
       app3.$mount("#room_instance");
       if($(window).height() < 600 || $(window).width() < 800){
           $("#panel").css("height","230px")
           .css("width","480px")
           .css("top","-15px")
           .css("padding-top","5px");
           $("#sidebar").css("height","180px");
           app3.otherIndex = 20;
           $("#ynModal").modal("hide");
       }
   }
}

function register(){ // emit:register
    $(".alert.alert-danger").hide();
    $(".alert.alert-success").hide();
    username = cleanInput($('#username').val().trim());
    password = cleanInput($('#password').val().trim());
    socket.emit('register',{
        username: username,
        password: password
    });

}

function login(){//emit: verifyWaiting
    $(".alert.alert-danger").hide();
    $(".alert.alert-success").hide();
    username = cleanInput($('#username').val().trim());
    password = cleanInput($('#password').val().trim());
    if($('#roomnumber').val() == null){
            $(".alert.alert-danger").text("请选择房间！").show();
            return;
        }
    room = cleanInput($('#roomnumber').val().trim());
    socket.emit('verifyWaiting',{
        username: username,
        password: password,
        room: room,
        type: "new"
    });
}

function changeRoom(){// emit:verifyWaiting
    roomto = cleanInput($('#targetRoom').val().trim());
    if(roomto >= ROOMAMOUNT){
        $(".alert.alert-danger").text("目标房间不合法！").show();
        return;
    }
    var message = "Leave room #"+room;
    addMessage(message,'announce');

    room = roomto;

    socket.emit('verifyWaiting',{
        room: room,
        type: "change"
    });
}

function cleanInput(input){
    return $('<div/>').text(input).html();
    //change '<' '>' and others to '&lt;' '&gt;'
}
function changePlace(a,b,i){//在b中值为i的一项跑到最前
    a = a.concat(a.splice(0,b.indexOf(i)));
    return a;
}

function ready(){
    if(prepared){
        $("#readybutton").text("准备");
    }
    else{
        $("#readybutton").text("取消");
    }
    prepared = !prepared;
    socket.emit("ready",prepared);
    addMessage({name:username,prepared:prepared},"prepare");
}

var getRandomColor = function(){
  return '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6);
}
function addMessage(data,type){
    if(!connected) return;
    if(type === 'chat'){
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

socket.on('registered', (data) => {
    if(data.valid){
        $(".alert.alert-success").text("注册成功！").show();
    }
    else{
        if(data.errorcode === 1){
            $(".alert.alert-danger").text("暂不开放注册！").show();
            return;
        }
    }
});

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

        if(host!=username){
            console.log(host+' '+username);
            $(".btn.btn-success").attr("disabled","disabled");
            $("#readybutton").removeAttr("disabled");
            $("#readybutton").text("准备");
        }

        $("#room").text("room#"+(room || 0)+"  ");
        $("#sidebar").html("<span style='font-weight:bold;'>用户列表：</span><br />");
        for(user in data.users){
            addMessage(user,'user');
        }
    }
    else{
        if(data.errorcode === 1){
            $(".alert.alert-danger").text("用户名或密码错误！").show();
            return;
        }
    }
});

socket.on('user joined',(data) => {
    var message = "Welcome "+data.username+"!";
    addMessage(message,'announce');
    addMessage(data.username,'user');

});

socket.on('generateCard', (data) => {
    if(data != null){
        console.log(data);
        app2.cards = data;
    }
});

socket.on('otherReady',(data) =>{
    addMessage(data,"prepare");
    console.log(data);
    if(host == username){
        data.already?$("#readybutton").removeAttr("disabled"):$("#readybutton").attr("disabled","disabled");
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

socket.on('statusUpdate', (data) =>{
    app3.tmp = data;
    app3.cardsAmount = data.cardsAmount || app3.cardsAmount;
    app3.basicCardsAmount = data.basicCardsAmount || app3.basicCardsAmount;
    if(data.usersName){
        data.userPoint = changePlace(data.userPoint,data.usersName,username);
        data.usersName = changePlace(data.usersName,data.usersName,username);
        data.usersName.splice(0,1);
        app3.myPoint = data.userPoint[0];
        data.userPoint.splice(0,1);
    }
    app3.otherName = data.usersName || app3.otherName;
    app3.otherPoint = data.userPoint || app3.otherPoint;
    app3.nowAction = data.nowAction == undefined ? app3.nowAction : data.nowAction;
    app3.nowCard = data.nowCard == undefined ? app3.nowCard : data.nowCard;
    app3.nowMoney = data.nowMoney == undefined ? app3.nowMoney : data.nowMoney;
    app3.nowBuy = data.nowBuy == undefined ? app3.nowBuy : data.nowBuy;
    app3.nowPlayer = data.nowPlayer == undefined ? app3.nowPlayer : data.nowPlayer;
    app3.nowStage = data.nowStage == undefined ? app3.nowStage : data.nowStage;
    app3.myDrop = data.drops || app3.myDrop;
    if(data.usingCard){
        app3.cardInAction.push(data.usingCard);
        addMessage(app3.nowPlayer + '使用了' + data.usingCard.chname,'rep');
    }
    if(data.nowVp){
        if(app3.nowPlayer == username){
            app3.myPoint = data.nowVp;
        }
        else{
            app3.otherPoint[app3.otherName.indexOf(app3.nowPlayer)] = data.nowVp;
        }
    }
    socket.emit('getCard');
    if(data.nowStage){
        if(data.nowStage == 'Action'){
            addMessage('第'+data.nowTurn+'回合，'+app3.nowPlayer+'的回合','rep');
        }
        addMessage('　'+app3.nowStage+'阶段','rep');
        if(data.nowStage == 'Action'){
            if(app3.nowPlayer == username){
                action = 0;
                for(cardkey in app3.myCardInHand){
                    if(app3.myCardInHand[cardkey].type == "行动") {action++;break;}
                }
                if(action == 0){
                    app3.nextStage();
                    return;
                }
            }
        }
        if(data.nowStage == 'Cleanup'){
            app3.cardInAction = [];
            if(app3.nowPlayer == username){
                app3.nextStage();
                return;
            }
        }
    }
    if(data.buyed){
        addMessage(app3.nowPlayer + '购买了' + data.buyed,'rep');
    }
});

socket.on('receive cards', (data) =>{
    app3.myCardInHand = data.cardsInHand;
    app3.myCard = data.cards;
});

socket.on('askyn', (data) =>{
   app3.modal_title = data.title;
   app3.modal_content = data.content;
   $("#ynModal").modal("show");
});

socket.on('end game',() => {
    console.log('end game');
    var wined = true;
    for(otpkey in app3.otherPoint){
        if (app3.otherPoint[otpkey] > app3.myPoint) wined = false;
    }
    if(wined){
        alert("you win!");
    }
    else {
        alert("you lose!");
    }
});

socket.on('user left', (data) => {
    addMessage(data.username+' is disconnected','announce');
    $("#username_"+data.username).remove()
});

socket.on('disconnect', (data) => {
    addMessage('You are disconnected','announce');
});

$("#loginModal").keyup(function(event){
    if(event.keyCode == 13){
        login();
    }
});
qwerty = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];

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

        keyCode = qwerty[0].indexOf(String.fromCharCode(event.keyCode));

        if(keyCode != -1){
            if(keyCode < 5)
                app3.buy(keyCode,'supply');
            if(keyCode > 5 && keyCode < 9)
                app3.buy(keyCode - 6,'basic');
            return;
        }
        keyCode = qwerty[1].indexOf(String.fromCharCode(event.keyCode));
        if(keyCode != -1){
            if(keyCode < 5)
                app3.buy(keyCode + 5,'supply');
            if(keyCode > 5 && keyCode < 9)
                app3.buy(keyCode - 6 + 3,'basic');
            return;
        }
        keyCode = qwerty[2].indexOf(String.fromCharCode(event.keyCode));
        if(keyCode != -1){
            if(keyCode > 5 && keyCode < 9)
                app3.buy(keyCode - 6 + 6,'basic');
            return;
        }

    }
});
