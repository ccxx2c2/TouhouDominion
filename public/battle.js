
var app3 = new Vue({
    data:{
        basicCards:cardSource[6],
        basicCardsAmount:[80,50,50,12,12,12,80],
        cards:[],
        cardsAmount:[12,12,12,12,12,12,12,12,12,12],
        cardArray:[],
        lens:[],//lengths of each expansions
        language:0,
        binded:0,
        username:username,
        myCardLength:0,
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
        modal_amount:0,
        modal_cards:[],
        aCardUsing:false,
        modal_from:'',
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
            if(!app3.nowPlayer == username){
              return;
            }
            if(app3.aCardUsing && (app3.modal_from == 'cardsInHand')){
                if(!app3.myCardInHand[index].chosen){
                  app3.modal_cards.push(index);
                  app3.myCardInHand[index].chosen = true;
              }
              else{
                  app3.modal_cards.splice(app3.modal_cards.indexOf(index),1);
                  app3.myCardInHand[index].chosen = false;
              }
            }
            else{
              socket.emit('useCard',index);
            }
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
        sendyn: (select)=>{
          socket.emit('sending yn',select);
          $('#ynModal').css('display','none');
          $('.backdrop').css('display','none');
        },
        sendCards: ()=>{
          socket.emit('sending cards',app3.modal_cards);
          $('#cardsModal').css('display','none');
          $('.backdrop').css('display','none');
          app3.modal_cards.forEach( (i) => {
            app3.myCardInHand[i].chosen = false;
          });
          app3.modal_cards = [];
        },
        log:console.log
    },
    updated:function(){
        this.bind();
    },
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
    app3.otherName = data.usersName == undefined ? app3.otherName : data.usersName;
    app3.otherPoint = data.userPoint == undefined ? app3.otherPoint : data.userPoint;
    app3.nowAction = data.nowAction == undefined ? app3.nowAction : data.nowAction;
    app3.nowCard = data.nowCard == undefined ? app3.nowCard : data.nowCard;
    app3.nowMoney = data.nowMoney == undefined ? app3.nowMoney : data.nowMoney;
    app3.nowBuy = data.nowBuy == undefined ? app3.nowBuy : data.nowBuy;
    app3.nowPlayer = data.nowPlayer == undefined ? app3.nowPlayer : data.nowPlayer;
    app3.nowStage = data.nowStage == undefined ? app3.nowStage : data.nowStage;
    app3.myDrop = data.drops == undefined ? app3.myDrop : data.drops;
    app3.myCardInHand = data.cardsInHand == undefined ? app3.myCardInHand : data.cardsInHand ;
    app3.myCardLength = data.cardsLength == undefined ? app3.myCardLength : data.cardsLength ;

    if(data.buyed){
        addMessage(app3.nowPlayer + '购买了' + data.buyed,'rep');
    }
    if(data.usingCard){
        app3.cardInAction.push(data.usingCard);
        addMessage(app3.nowPlayer + '使用了' + data.usingCard.chname,'rep');
    }
    if(data.aCardUsing != undefined) app3.aCardUsing = data.aCardUsing;

    if(data.nowVp){
        if(app3.nowPlayer == username){
            app3.myPoint = data.nowVp;
        }
        else{
            app3.otherPoint[app3.otherName.indexOf(app3.nowPlayer)] = data.nowVp;
        }
    }
    if(data.nowStage){
        if(data.nowStage == 'Action'){
            addMessage('第'+data.nowTurn+'回合，'+app3.nowPlayer+'的回合','rep');
        }
        addMessage('　'+app3.nowStage+'阶段','rep');
    }
    if(app3.nowPlayer == username){
        if(app3.nowStage == 'Action' && !app3.aCardUsing){
            if(app3.nowAction == 0){
                app3.nextStage();
                return;
            }
            action = 0;
            for(cardkey in app3.myCardInHand){
                if(app3.myCardInHand[cardkey].type == "行动") {action++;}
            }
            if(action == 0){
                app3.nextStage();
                return;
            }
        }
        if(app3.nowStage == 'Buy'){
            if(app3.nowBuy == 0){
                app3.nextStage();
                return;
            }
          /*  resource = 0;
            for(cardkey in app3.myCardInHand){
                if(app3.myCardInHand[cardkey].type == "资源") {resource++;break;}
            }
            if(resource == 0 && app3.nowMoney == 0){
                app3.nextStage();
                return;
            }*/
        }
    }
    if(app3.nowStage == 'Cleanup'){
        app3.cardInAction = [];
        if(app3.nowPlayer == username){
            app3.nextStage();
            return;
        }
    }
});

socket.on('askyn', (data) =>{
   app3.modal_title = data.title;
   app3.modal_content = data.content;
   $('#ynModal').css('display','');
   $('.backdrop').css('display','');
});

socket.on('askCards', (data) =>{
   app3.modal_title = data.title;
   app3.modal_content = data.content;
   app3.modal_amount = data.amount;
   app3.modal_from = data.from;
   $('#cardsModal').css('display','');
   $('.backdrop').css('display','');
});

socket.on('sendRep', (content) => {
  addMessage(content,'rep');
});


socket.on('end game',() => {
    console.log('end game');
    var wined = true;
    for(otpkey in app3.otherPoint){
        if (app3.otherPoint[otpkey] > app3.myPoint) wined = false;
    }
    if(wined){
        addMessage("you win!",'announce','info');
    }
    else {
        addMessage("you lose!",'announce','info');
    }
});
