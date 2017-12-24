//"use strict";
var app3 = new Vue({
    data: {
        basic: cardSource[6],
        basicRemain: [80,50,50,12,12,12,80],
        supply: [],
        supplyRemain: [12,12,12,12,12,12,12,12,12,12],
        cardArray: [],
        lens: [],//lengths of each expansions
        language: 0,
        binded: 0,
        username: username,
        myCardLength: 0,
        myHand: [],
        myDrop: [],
        myPoint: 0,
        cardInAction: [],
        nowMoney: 0,
        nowBuy: 0,
        nowAction: 0,
        nowCard: 0,
        nowStage: 'Action',
        otherName: [],
        otherCard: [],
        otherDrop: [],
        otherPoint: [3,3,3,3,3],
        trash: [],
        nowPlayer: "",
        otherIndex: 10,
        modal_title: '',
        modal_content: '',
        modal_amount: 0,
        modal_cards: [],
        aCardUsing: false,
        modal_from: '',
    },
    created: function(){
    },
    methods: {
        name: app2.name,
        filename: app2.filename,
        title: app2.title,
        description: app2.description,
        bind:  () => {
            //functions for bootstrap
            if(this.binded >= $(".cards").length) return;
                $(".cards").each(function(i,e){//index,element
                  // can't change to arrow function
                    $(this).popover({});
                });
            this.binded = $(".cards").length;
        },
        use: (index) => {
            if(!app3.nowPlayer === username){
              return;
            }
            // choosing card
            if(app3.aCardUsing && (app3.modal_from === 'hand')){
                if(!app3.myHand[index].chosen){
                  app3.modal_cards.push(index);
                  app3.myHand[index].chosen = true;
              }
              else{
                  app3.modal_cards.splice(app3.modal_cards.indexOf(index),1);
                  app3.myHand[index].chosen = false;
              }
            }
            //using card
            else {
              socket.emit('useCard', index);
            }
        },
        buy: (index,src) => {
            if(app3.nowPlayer === username)
                socket.emit('buyCard', {
                  index: index,
                  src: src
                });
        },
        nextStage: () => {
            if(app3.nowPlayer === username)
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
            app3.myHand[i].chosen = false;
          });
          app3.modal_cards = [];
        }
    },
    updated: function(){
        this.bind();
    },
});


socket.on('statusUpdate', (data) =>{
    app3.supplyRemain = data.supplyRemain || app3.supplyRemain ;
    app3.basicRemain = data.basicRemain || app3.basicRemain;
    if(data.usersName){
        data.userPoint = changePlace(data.userPoint, data.usersName, username);
        data.usersName = changePlace(data.usersName, data.usersName, username);
        app3.myPoint = data.userPoint[0];
        data.usersName.shift();
        data.usersName.shift();
    }
    app3.otherName = data.usersName === undefined ? app3.otherName : data.usersName;
    app3.otherPoint = data.userPoint === undefined ? app3.otherPoint : data.userPoint;
    app3.nowAction = data.nowAction === undefined ? app3.nowAction : data.nowAction;
    app3.nowCard = data.nowCard === undefined ? app3.nowCard : data.nowCard;
    app3.nowMoney = data.nowMoney === undefined ? app3.nowMoney : data.nowMoney;
    app3.nowBuy = data.nowBuy === undefined ? app3.nowBuy : data.nowBuy;
    app3.nowPlayer = data.nowPlayer === undefined ? app3.nowPlayer : data.nowPlayer;
    app3.nowStage = data.nowStage === undefined ? app3.nowStage : data.nowStage;
    app3.myDrop = data.drops === undefined ? app3.myDrop : data.drops;
    app3.myHand = data.hand === undefined ? app3.myHand : data.hand ;
    app3.myCardLength = data.cardsLength === undefined ? app3.myCardLength : data.cardsLength ;
    app3.aCardUsing = data.aCardUsing === undefined ? app3.aCardUsing : data.aCardUsing;

    if(data.usingCard){
        app3.cardInAction.push(data.usingCard);
        addMessage(`${app3.nowPlayer} 使用了 ${data.usingCard.chname}`, 'rep');
    }

    if(data.nowVp){
        if(app3.nowPlayer === username){
            app3.myPoint = data.nowVp;
        }
        else{
            app3.otherPoint[app3.otherName.indexOf(app3.nowPlayer)] = data.nowVp;
        }
    }
    if(data.nowStage !== undefined){  
      if(data.nowStage !== addedStage){
          if(data.nowStage === 'Action'){
              addMessage(`第${data.nowTurn}回合，${app3.nowPlayer}的回合`,'rep');
          }
          addMessage(`　${app3.nowStage}阶段`,'rep');
          addedStage = data.nowStage;
      }

      if(app3.nowPlayer === username){
          if(app3.nowStage === 'Action' && !app3.aCardUsing){
              if(app3.nowAction === 0){
                  app3.nextStage();
                  return;
              }
              let action = 0;
              for(let cardkey in app3.myHand){
                  action += app3.myHand[cardkey].type === "行动" ? 1 : 0;
              }
              if(action === 0){
                  app3.nextStage();
                  return;
              }
          }
          if(app3.nowStage === 'Buy'){
            console.log(app3.nowBuy);
              if(app3.nowBuy === 0){
                  app3.nextStage();
                  return;
              }
          }
      }
      if(app3.nowStage === 'Cleanup'){
          app3.cardInAction = [];
          if(app3.nowPlayer === username){
              app3.nextStage();
              return;
          }
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

socket.on('sendRep', (data) => {
  addMessage(data.content,'rep');
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
