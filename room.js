"use strict";
var g = require(__dirname+'/global.js');
var cardData = require(__dirname+'/public/data.js');
var Card = require(__dirname+'/card.js').Card;
var DomCard = require(__dirname+'/card.js').DomCard;

var rooms = g.rooms;
var pages = g.pages;
const stage = g.stage;
class Room{
    constructor(props){
        if(typeof(props) === 'undefined'){
          props = {};
        }
        this.sockets = props.sockets || [];
        this.users = props.users || {};
        this.userOrder = props.userOrder || []; //人物顺序
        this.trash = props.trash || [];
        this.host = props.host || undefined;
        this.supply = props.supply || [];
        this.noin = props.noin || [[],[],[26,27,28,29,30],[],[19,20,21],[],[1,2,3,4,5,6,7]];
        this.cardArray = props.cardArray || [];
        this.lens = props.lens || []; //lengths of each expansions
        this.supplyTotal = props.supplyTotal || [10,10,10,10,10,10,10,10,10,10];
        this.supplyRemain = props.supplyRemain || [10,10,10,10,10,10,10,10,10,10];
        this.basic = props.basic || [1,2,3,4,5,6,7];
        this.basicTotal = props.basicTotal || [60,40,30,14,12,12,30];
        this.basicRemain = props.basicRemain || [60,40,30,14,12,12,30];
        this.startCards = props.startCards || [{
            expansion:"基础牌",
            number:1,
            amount:7
        },{
            expansion:"基础牌",
            number:4,
            amount:3
        }];
        this.paging = props.paging || "waiting";// waiting, battle
        this.nowPlayer = props.nowPlayer || "";
        this.nowPlayerPoint = props.nowPlayerPoint || 0;
        this.nowStage = props.nowStage || 0;
        this.vps = props.vps || 0;
        this.no = props.no || 0;
    }

    show(){
        console.log(`${new Date().toLocaleString()} users in room#${this.no} are:{name,prepared}`);
        console.log(Object.keys(this.users));
        let states = [];
        for(let username in this.users){
            states.push(this.users[username].state);
        }
        console.log(states);
        console.log(`roomhost is ${this.host}`);
    }

    generateCard(limit, type){
      // global cardData
        let randarr = [];
        this.cardArray = [];

        cardData.forEach( (array, index) => {
          array.forEach((info, i) => {
              if(this.noin[index].includes(i + 1)
              || type === 'available' && typeof(info.use) === 'undefined'){
                  return;
              }
              let card = new Card({
                  expansion: info.expansion,
                  number: i + 1,
                  src: 'supply',
              });
              this.cardArray.push(card);
          });
        });

        this.cardArray.shuffle();
        limit = Math.min(limit, this.cardArray.length);
        randarr = this.cardArray.slice(0, limit);
        this.supply = ['a'];// f**k jsArray
        getCard(this.supply, randarr, limit);
    }

    changeCard(limit, index){
        let randarr = [];
        this.cardArray[this.cardArray.length] = this.cardArray[index];
        this.cardArray.shuffle(limit);
        this.cardArray[index] = this.cardArray[this.cardArray.length - 1];
        this.cardArray.splice(this.cardArray.length - 1, 1);
        randarr = this.cardArray.slice(0,limit);
        getCard(this.supply,randarr,limit,index);
    }


    // emit: startgame, statusUpdate
    initialGame(){
        console.log(`${new Date().toLocaleString()} game in room#${this.no} started`);
        this.paging = "battle";

        // change basic card total by players.length
        if(Object.keys(this.users).length == 2){
            this.basicTotal[4] = 8;
            this.basicTotal[5] = 8;
            this.basicTotal[6] = 10;
        }
        else if(Object.keys(this.users).length == 3){
            this.basicTotal[3] = 21;
            this.basicTotal[6] = 20;
        }
        else{
            this.basicTotal[3] = 12 + 3 * Object.keys(this.users).length;
        }
        this.basicRemain = this.basicTotal.slice();
        this.supplyTotal = [];
        for(let i = this.supply.length - 1; i >= 0; i -= 1){
          if(!this.supply[i].types.includes('胜利点')){
            this.supplyTotal[i] = 10;
          }
          else {
            this.supplyTotal[i] = 8;
          }
        }
        this.supplyRemain = this.supplyTotal.slice();
        // get basic cards
        let tmp = [];
        this.basic.forEach((number)=>{
            tmp.push({
                expansion: "基础牌",
                number: number,
                src:'basic',
            });
        });
        getCard(this.basic, tmp, tmp.length);
        for(let socket of this.sockets){
            socket.emit('startGame',{
                page: pages[2],
                supply: this.supply,
                basic: this.basic
            });
        }

        // gain start card
        for(let userName in this.users){
            let user = this.users[userName];
            for(let cardkey in this.startCards){
                let card = this.startCards[cardkey];
                for(let i = 0;i < card.amount;i += 1){
                    user.gainCard("deck", "basic", card.number - 1);
                }
            }
            user.deck.shuffle();
            user.draw(5);
            this.users[userName] = user;
        }

        // make player order
        this.userOrder = Object.keys(this.users);
        this.userOrder.shuffle();
        this.nowPlayer = this.userOrder[this.nowPlayerPoint];
        this.nowStage = 0;
        this.vps = [];
        this.userOrder.forEach((userkey) => {
            this.vps.push(this.users[userkey].vp);
        });

        this.show();
        for(let socket of this.sockets){
            console.log(socket.username);
            socket.paging = "battle";
            socket.emit("statusUpdate",{
                supplyRemain: this.supplyRemain,
                basicRemain: this.basicRemain,
                usersName: this.userOrder,
                userPoint: this.vps,
                nowPlayer: this.nowPlayer,
                nowStage: stage[this.nowStage % 3],
                hand: this.users[socket.username].hand,
                cardsLength: this.users[socket.username].deck.length,
                nowAction: 1,
                nowMoney: 0,
                nowBuy: 1,
                nowCard: 5,
                nowTurn: 1,
            });
        }
    }


    endGame(){
        console.log(`${new Date().toLocaleString()} game in room#${this.no} ended`);
        for(let socket of this.sockets){
          socket.emit("end game");
          socket.paging = "waiting";
        }
        this.paging = "waiting";

        rooms[this.no] = new Room({no: this.no});
    }
}

function getCard(target, src, limit, index){
    if(typeof(target) === 'undefined' || target[0] === undefined){
        target = [];
        index = undefined;
    }
    console.log(`${new Date().toLocaleString()} in getCard`);
    console.log(limit, index);
    for(let i = 0; i < limit; i += 1){
        if(typeof(index) !== "undefined" && index !== i) continue;
        for(let j = 0; j < cardData.length; j += 1){
          let expansion = cardData[j];
          if(expansion[0].expansion === src[i].expansion){
              target[i] = {};
              Object.assign(target[i], src[i], expansion[src[i].number-1]);
              target[i] = new DomCard(target[i]);
              target[i].index = i;
              console.log(target[i].name.ch,i);
              break;
          }
        }
    }
}
module.exports = Room;
