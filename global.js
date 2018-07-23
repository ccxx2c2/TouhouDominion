"use strict";
var fs = require('fs');
var rooms = [];
const stage = ['Action','Buy','Cleanup'];
const ROOMAMOUNT = 3;

/**
 * Fisher–Yates shuffle
 */
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
function sleep(delay){
  return ()=>{
    return new Promise((resolve, reject) => {
      setTimeout(resolve, delay);
    })
  }
}

var pages=[];
function myread(path,i){
    fs.readFile(__dirname + path,function(err,data){
        if(err){
            console.log(err);
        }else{
            pages[i]=data.toString();
        }
    });
}
myread('/public/index.html',0);
myread('/private/waiting.html',1);
myread('/private/battle.html',2);

function ask(args){
    let socket = args.socket;
    let title = args.title;
    let content = args.content;
    let area = args.area;
    let min,max;
    [min, max] = [args.min, args.max];
    let myFilter;
    let room = rooms[socket.room];
    let user = room.users[socket.username];
    console.log('in ask');
    socket.asking = true;
    if(typeof(args.myFilter) === 'function'){
        if(area === 'hand'){
          myFilter = {
            hand:user.hand.map(args.myFilter)
          };
        }
        else if(area === 'kingdom' || area === 'supply' || area === 'basic'){
          console.log("in myFilter");
          myFilter = {
                supply:room.supply.map(args.myFilter),
                basic: room.basic.map(args.myFilter)
          };
        }
    }
    else if(Array.isArray(args.myFilter)){
      myFilter = args.myFilter;
    }
    generalStatus(socket,undefined,false);
    let data = {
      title:title,
      content:content,
      area:area,
      myFilter:myFilter,
      min:min,
      max:max,
    }
    console.log(data,'to',socket.username);
    socket.emit('ask',data);
    return new Promise( (resolve,reject) =>{
        socket.once('answer', (data) =>{
            console.log('in answering');
            console.log(data);
            if(!socket.asking ) return;
            if(area === 'yn'){
              socket.asking = false;
              resolve(data === 'y');
            }
            else if(area === 'check'){
              if(data.length != myFilter.length) return;
              for(let i = data.length - 1; i >= 0; i -= 1){
                if(max < 0){
                    data[i] = false;
                }
                if(data[i]){
                    max -= 1;
                    min -= 1;
                }
              }
              if(min > 0)return;
              socket.asking = false;
              resolve(data);
            }
            else if(area === 'hand'){
              let cards = [];
              if(Array.isArray(data)) cards = data;
              // 随机 补齐卡片 未生效
              if(cards.length < min){
                  let tmpCards = [];
                  rooms[socket.room].users[socket.username][area].forEach((e,i)=>{
                      if(!(cards.includes(i)) && (myFilter === undefined || myFilter[i])) tmpCards.push(i);
                  });
                  tmpCards.shuffle();
                  cards = cards.concat(tmpCards.slice(0,min - cards.length));
              }
              // 去掉多余卡片
              if(cards.length > max){
                  cards = cards.slice(0,max);
              }
              socket.asking = false;
              resolve(cards);
            }
            else if(area === 'kingdom' || area === 'supply' || area === 'basic'){
              socket.asking = false;
              data.filter((card) => {
                return ((area === 'kingdom' || area === card.src)  && args.myFilter(card)) ;
              });
              if(data.length > max){
                data = data.slice(0, max);
              }
              resolve(data);
              //data:{src,index} 
            }
        });
    });
}

function generalStatus(socket, newTurn,fresh){
  let room = rooms[socket.room];
  let user = room.users[socket.username];
  if( socket.username === room.nowPlayer || newTurn){
    socket.emit("statusUpdate",{
        supplyRemain: room.supplyRemain,
        basicRemain: room.basicRemain,
        nowPlayer: room.nowPlayer,
        nowStage: stage[room.nowStage % 3],
        nowMoney: user.money,
        nowCard: user.hand.length,
        nowAction: user.action,
        nowBuy: user.buy,
        nowVp: newTurn ? undefined : user.vp,
        nowDuration: newTurn ? undefined : user.duration,
        drops: user.drops,
        aCardUsing: user.aCardUsing,
        hand: user.hand,
        cardsLength: user.deck.length,
        nowTurn: parseInt(room.nowStage / (3 * Object.keys(room.users).length) + 1),
        fresh:fresh
    });
    socket.to(socket.room).emit("statusUpdate",{
        supplyRemain: room.supplyRemain,
        basicRemain: room.basicRemain,
        nowPlayer: room.nowPlayer,
        nowStage: stage[room.nowStage % 3],
        nowMoney: user.money,
        nowCard: user.hand.length,
        nowVp: newTurn ? undefined : user.vp,
        nowDuration: newTurn ? undefined : user.duration,
        nowAction: user.action,
        nowBuy: user.buy,
        nowTurn: parseInt(room.nowStage / (3 * Object.keys(room.users).length) + 1)
    });
  }
  else {
      socket.emit("statusUpdate",{
          supplyRemain: room.supplyRemain,
          basicRemain: room.basicRemain,
          myVp: user.vp,
          nowDuration: user.duration,
          nowStage: stage[room.nowStage % 3],
          drops: user.drops,
          aCardUsing: user.aCardUsing,
          hand: user.hand,
          nowTurn: parseInt(room.nowStage / (3 * Object.keys(room.users).length) + 1)
      });
      socket.to(socket.room).emit("statusUpdate",{
          supplyRemain: room.supplyRemain,
          basicRemain: room.basicRemain,
          otherVp: user.vp,
          nowDuration: user.duration,
          nowStage: stage[room.nowStage % 3],
          oneName: socket.username,
          nowTurn: parseInt(room.nowStage / (3 * Object.keys(room.users).length) + 1)
      });
  }
}

function sendRep(socket,user,content){
  socket.emit("sendRep",{
    content: content,
  });
  socket.to(socket.room).emit("sendRep",{
    content: content,
  });
}

exports.rooms = rooms;
exports.stage = stage;
exports.pages = pages;
exports.ROOMAMOUNT = ROOMAMOUNT;
exports.ask = ask;
exports.generalStatus = generalStatus;
exports.sendRep = sendRep;
