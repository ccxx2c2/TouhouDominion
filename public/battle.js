"use strict";
var app3 = new Vue({
    data: {
        basic: [],
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
        modal_min: 0,
        modal_max: '',
        modal_cards: [],
        modal_area: '',
        modal_filter: [],
        aCardUsing: false,
        asking: false,
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
            if(!app3.nowPlayer === username
            && !app3.asking){
              return;
            }
            // choosing card
            if(app3.asking){
              if((app3.modal_area === 'hand')){
                  if(!app3.myHand[index].chosen){
                    app3.modal_cards.push(index);
                    app3.myHand[index].chosen = true;
                }
                else{
                    app3.modal_cards.splice(app3.modal_cards.indexOf(index),1);
                    app3.myHand[index].chosen = false;
                }
              }
            }
            //using card
            else {
              socket.emit('useCard', index);
            }
        },
        buy: (index,src) => {
            if(!app3.nowPlayer === username
            && !app3.asking){
              return;
            }
            // choosing card
            if(app3.asking){
              if((app3.modal_area === 'kingdom' || app3.modal_area === 'supply' || app3.modal_area === 'basic'
              && app3.modal_filter[src][index])){
                  if(!app3[src][index].chosen){
                    app3.modal_cards.push({index:index,src:src});
                    app3[src][index].chosen = true;
                  }
                  else{
                    for(let i = app3.modal_cards.length - 1; i >= 0; i -= 1){
                        if(app3.modal_cards[i].index === index
                        && app3.modal_cards[i].src === src ){
                          app3.modal_cards.splice(i,1);
                          break;
                        }
                    }
                    app3[src][index].chosen = false;
                }
              }
            }
            //buying card
            else {
                socket.emit('buyCard', {
                  index: index,
                  src: src
                });
            }
        },
        nextStage: () => {
            if(app3.nowPlayer === username)
                socket.emit('nextStage');
        },
        sendAnswer: (select)=>{
          app3.asking = false;
          if(app3.modal_area === 'yn'){
            socket.emit('answer',select);
          }
          else if(app3.modal_area === 'check'){
              $(".panel-body").find("input[type ='checkbox']").each(function(){
                  app3.modal_cards.push($(this).prop("checked"));
              });
              socket.emit('answer',app3.modal_cards);
          }
          else if(app3.modal_area === 'hand'
          || app3.modal_area === 'kingdom'
          || app3.modal_area === 'supply'
          || app3.modal_area === 'basic'){
            socket.emit('answer',app3.modal_cards);
            if(app3.modal_area === 'hand'){
              app3.modal_cards.forEach( (i) => {
                app3.myHand[i].chosen = false;
              });
            }
            else {
              app3.modal_cards.forEach( (obj) => {
                app3[obj.src][obj.index].chosen = false;
              });
            }
            app3.modal_cards = [];
          }
          $('#askModal').css('display','none');
          $('.backdrop').css('display','none');
        },
        cssGenerate: (place, card, index) => {
          let ret = '';
          if(app3.asking
          && (card.chosen)){
            ret += 'chosen ';
          }

          if(app3.asking
          && !(card.chosen)
          && (app3.modal_area === place || (app3.modal_area === 'kingdom' && place !== 'hand'))
          && (typeof(app3.modal_filter) === 'undefined'
              || typeof(app3.modal_filter[place][index]) === 'undefined'
              || app3.modal_filter[place][index])){
            ret += 'selectable ';
          }

          if(place === 'basic' || place === 'supply'){
              if(app3.asking ||((app3.nowPlayer == username)
              && (card.cost <= app3.nowMoney)
              && (app3.nowStage === 'Buy')
              && (app3.nowBuy > 0)
              && app3[place + "Remain"][index] > 0)){
                ret += 'cardActive ';
              }
              if(place === 'basic'){
                  return 'basicCard ' + ret;
              }
             if(place === 'supply'){
                ret += 'cards img-responsive col-xs-2 col-sm-2 col-md-2 col-lg-2 ';
                return ret;
              }
          }
           if(place === 'hand'){
             if(app3.asking || ((app3.nowPlayer == username)
             && ((app3.nowStage == 'Buy') && (card.type == '资源')
                ||　(app3.nowStage == 'Action') && (card.type == '行动')))){
                 ret += 'cardActive ';
             }
             return 'CardInHand ' + ret;
           }
        },
        buttonAvailable: () => {
            return app3.modal_cards.length < app3.modal_min && jQuery('.selectable').length > 0;
        },
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
        data.userPoint.shift();
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
    if(data.myVp) app3.myPoint = data.myVp;
    if(data.otherVp){
      app3.otherPoint[app3.otherName.indexOf(data.oneName)] = data.otherVp;
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

socket.on('ask', (data) =>{
   app3.modal_title = data.title;
   app3.modal_content = data.content;
   app3.modal_area = data.area;
   app3.modal_min = data.min;
   app3.modal_max = data.max;
   app3.modal_filter = data.myFilter;//{src,index}
   app3.asking = true;
   console.log(data);
   var p = data;
   app3.modal_cards = [];
   $('#askModal').css('display','');
   if(data.area === 'kingdom' || data.area === 'supply' || data.area === 'basic'){
     $("#askModal").css("top","70%");
   }
   else{
     $("#askModal").css("top","");
   }
   $('.backdrop').css('display','');
});

socket.on('sendRep', (data) => {
  addMessage(data.content,'rep');
});


socket.on('end game',() => {
    console.log('end game');
    var wined = true;
    for(let otpkey in app3.otherPoint){
        if (app3.otherPoint[otpkey] > app3.myPoint) wined = false;
    }
    if(wined){
        addMessage("you win!",'announce','info');
    }
    else {
        addMessage("you lose!",'announce','info');
    }
});
