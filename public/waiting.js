
var app2 = new Vue({
    data:{
        roomAmount:Array.from({length:ROOMAMOUNT}, (v, k) => k),
        cards:[],
        noin:[[],[],[26,27,28,29,30],[],[19,20,21],[],[1,2,3,4,5,6,7]],
        cardArray:[],
        language:0,
        lim:10,
        binded:0,
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
            '妖': false,
            '永': false,
            'Ex': false,
            '风': false,
            '地': false
          },
       }
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

function changeRoom(){// emit:verifyWaiting
    roomto = $('#targetRoom').val();
    if(roomto >= ROOMAMOUNT){
        $(".alert.alert-danger").text("目标房间不合法！").show();
        return;
    }
    var message = "Leave room #" + room;
    addMessage(message,'announce');

    room = roomto;

    socket.emit('verifyWaiting',{
        room: room,
        type: "change"
    });
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
