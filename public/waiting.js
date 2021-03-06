"use strict";

var app2 = new Vue({
    data:{
        roomAmount: Array.from({length:ROOMAMOUNT}, (v, k) => k),
        supply: [],
        noin: [[], [], [26,27,28,29,30], [], [19,20,21], [], [1,2,3,4,5,6,7]],
        cardArray: [],
        la: 'ch',
        lim: 10,
        binded: 0,
        options: {
          'exPackage': {
            'type': 'checkbox',
            'text': '指定额外卡组：',
            '5元10分': false,
            '天气': false,
            '船': false,
            '城': false,
            '璋': false,
            '魔法使': false
          },
          'initialDrop': {
            'type': 'radio',
            'text': '指定起始手牌：',
            '7钱3分': true,
            '7钱3地灵': false,
            '4钱3飞碟3分': false,
          },
          'package': {
            'type': 'checkbox',
            'text': '指定起始卡包：',
            '红': true,
            '妖': true,
            '永': true,
            'Ex': false,
            '风': false,
            '地': false
          },
       }
    },
    created: function(){
    },
    methods:{
        generate: function(limit){
            if(host !== username) return;
            socket.emit('generateCard',{
                limit: limit
            });
        },
        generateAvailable: function(limit){
            if(host !== username) return;
            socket.emit('generateCard',{
                limit: limit,
                type:'available'
            });
        },
        change: function(index){
            if(host !== username) return;
            let limit = $(".cards").length;
            socket.emit('generateCard',{
                limit: limit,
                index: index
            });
        },
        filename: function(card){
            let num = "00" + card.number;
            num = num.slice(num.length - 3, num.length);
            return `./pic/${card.expansion}/${card.expansion}${num}.jpg`;
        },
        title: function(card){
              let str = card.types.reduce((a, b) => a + ' - ' + b);
              str += ' ' + card.expansion;
              str += ' ' + card.cost;
              return card.name[this.la] + ' ' + str;
          },
        description: function(card){
          return card.effect[this.la] + (card.special[this.la] === '' ? ''
          : `\n————————\n${card.special[this.la]}`);
        },
        bind: function(){
            //functions for bootstrap
            if(this.binded >= $(".cards").length) return;
                $(".cards").each(function(i,e){//index,element
                  // can't change to arrow function
                    $(this).popover({});
                });
            this.binded = $(".cards").length;
        },
    },
    updated:function(){
        this.bind();
    },
    mounted: function(){
        if(host !== username){
            console.log(`${host} ${username}`);
            $(".btn.btn-success").attr("disabled","disabled");
        }
        else {
            $("#readybutton").text("开始");
            $("#readybutton").attr("disabled","disabled");
        }
    },
    destroy: function(){
      $(".cards").each(function(i,e){//index,element
          $(this).popover('hide');
      });
    }
});
function changeRoom(){// emit:verifyWaiting
  // global room
    let roomto = $('#targetRoom').val();
    if(roomto >= ROOMAMOUNT){
        $(".alert.alert-danger").text("目标房间不合法！").show();
        return;
    }
    let message = "Leave room #" + room;
    addMessage(message,'announce',"info");

    room = roomto;

    socket.emit('verifyWaiting',{
        room: room,
        type: "change"
    });
}

function ready(){//emit ready
  //global prepared,username,host
    if(prepared){
        $("#readybutton").text("准备");
    }
    else{
        $("#readybutton").text("取消");
    }
    prepared = !prepared;
    socket.emit("ready",prepared);
    if(username !== host){
      addMessage({name:username,prepared:prepared},"prepare");
    }
}

socket.on('generateCard', (data) => {
    if(data !== null){
        console.log(data);
        app2.supply = data;
        if($("#readybutton").text() === "取消"){
            $("#readybutton").click();
        }
    }
});

socket.on('otherReady',(data) =>{
  // global host,username
    addMessage(data,"prepare");
    if(host === username){
        data.already
        ? $("#readybutton").removeAttr("disabled")
        : $("#readybutton").attr("disabled","disabled");
    }
});
