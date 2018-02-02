var express = require('express');
var app = express();
var fs = require('fs');
var privateKey  = fs.readFileSync('/root/private.pem', 'utf8');
var certificate = fs.readFileSync('/root/file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
//var http = require('http').Server(app);
var https = require('https').createServer(credentials, app);
var path = require('path');
var io = require('socket.io')(https);
var cardData = require(__dirname+'/public/data.js');
var userList = require(__dirname+'/private/users.js');
var unlogUserList = Object.keys(userList);

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

function sleep(delay){
  return ()=>{
    return new Promise((resolve, reject) => {
      setTimeout(resolve, delay);
    })
  }
}

var pages=[];
function myread(path,i){
    fs.readFile(__dirname+'/private/'+path,function(err,data){
        if(err){
            console.log(err);
        }else{
            pages[i]=data.toString();
        }
    });
}

myread('waiting.html',0);
myread('battle.html',1);

//http.listen(80);
https.listen(443, function(){
  console.log(new Date().toLocaleString() + ' listening on *:443');
});

app.use(express.static(path.join(__dirname,'public')));
/*app.get('/', function(req, res) {
  res.writeHead(301,{
      'Location':'https://dominion.naide.me/index.html'
  });
  res.end();
});*/
var rooms = [];
var stage = ['Action','Buy','Cleanup'];
class Room{
    constructor(props){
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
    }
    show(){
        console.log(`${new Date().toLocaleString()} users in room#${rooms.indexOf(this)} are:{name,prepared}`);
        console.log(Object.keys(this.users));
        var statuses = [];
        for(var username in this.users){
            statuses.push(this.users[username].status);
        }
        console.log(statuses);
        console.log(`roomhost is ${this.host}`);
    }
}

class User{
    constructor(props){
        this.socket = props.socket || '';
        this.room = props.room || "";
        this.status = props.status || "waiting"; //waiting, prepared, gaming,  watching
        this.hand = props.hand || [];
        this.deck = props.deck || [];
        this.drops = props.drops || [];
        this.actionArea = props.actionArea || [];
        this.duration = props.duration || [];
        this.money = props.money || 0;
        this.vp = props.vp || 0;
        this.action = props.action || 1;
        this.buy = props.buy || 1;
        this.affect = props.affect || true;
        this.aCardUsing = props.aCardUsing || false;
        this.actionUsed = props.actionUsed || 0;
        this.onGain = props.onGain || {};
        this.beforeGain = props.beforeGain || {};
        this.onLost = props.onLost || {};
        this.cardAmount = props.cardAmount || 0;
        this.temp = props.temp || [];
        this.gained = props.gained || {supply:{},basic:{}};//src:{index:type}
    }

    async gainCard(to, src, index, type, place = 'bottom'){
        let room = rooms[this.room];
        if(room[src + "Remain"][index] <= 0) return;
        let card = new DomCard(room[src][index]);
       for(let cardid in this.beforeGain){
          let eff = this.beforeGain[cardid];
          if(await eff.func(this, exFunctions, eff.from, card,to) === false) return;//youmei gumi
        }
        card.no = room[src + "Total"][index] - room[src + "Remain"][index] + 1;
        card.id = (src === 'basic' ? 20 : 0) * 100000 + index * 100 + card.no;
        card.index = index;
        card.src = src;
        room[src + "Remain"][index] -= 1;
        if(type !== undefined){
          console.log("in gain card");
          console.log(card.chname, card.vp, this.money, card.cost, card.index);
        }
        if(card.vp !== undefined){
            this.vp += card.vp;
        }

        //affect ongain effects
        if(card.onGain !== undefined){
          console.log("in card.ongain");
           await card.onGain(this,exFunctions,card);
        }
        if(place === 'bottom')
          this[to].push(card);
        else if (place === 'top'){
          this[to].unshift(card);
        }
        this.cardAmount += 1;
        for(let cardid in this.onGain){
          let eff = this.onGain[cardid];
          console.log("in user.ongain");
          await eff.func(this, exFunctions, eff.from, card,to);
        }

        // send content
        if(type !== undefined){
          let content = type === 'buy'
          ? `${this.socket.username} 购买了 ${room[src][index].chname}`
          : type === 'gain'
          ? `${this.socket.username} 获得了${card.chname}` : undefined ;
          generalStatus(this.socket);
          sendRep(this.socket, this, content);
          this.gained[src][index] = type;
        }
        // judge if game end
        if(room[src + "Remain"][index] === 0){
            let usedup = 0;
            room.basicRemain.forEach((val) => {
                if(val <= 0) usedup += 1;
            });
            room.supplyRemain.forEach((val) => {
                if(val <= 0) usedup += 1;
            });
              if(room.basicRemain[5] === 0 || usedup >= 3) {
                endGame(this.socket.room);
              return;
            }
        }
    }

    gainMoney(amount){
        this.money += amount;
    }

    gainBuy(amount){
        this.buy += amount;
    }

    gainAction(amount){
        this.action += amount;
    }

    find(amount){
        console.log("in usr.find");
        console.log("amount:",amount,"length:",this.deck.length);
        if(this.deck.length < amount){
            this.drops.shuffle();
            this.deck = this.deck.concat(this.drops);
            this.drops = [];
        }
        return this.deck.slice(0,amount);
    }
    draw(amount){
        console.log("in usr.draw");
        console.log("amount:",amount,"length:",this.hand.length);
        if(this.deck.length < amount){
            this.drops.shuffle();
            this.deck = this.deck.concat(this.drops);
            this.drops = [];
        }
        this.hand = this.hand.concat(this.deck.splice(0,amount));
        this.socket.emit("statusUpdate", {
              hand: this.hand,
        });
    }

    drop(amount, from, to = 'drops', place = 'bottom'){
      console.log("in usr.drop");
        if(amount == 'all'){
            this[to] = this[to].concat(this[from]);
            this[from] = [];
        }
        else if(Array.isArray(amount)){
          let myamount = amount.slice();
          myamount.sort((a,b)=>{return a<b;});
          myamount.forEach((index) =>{
              console.log(index, this[from][index].chname, this[from][index].no);
              if(place === 'bottom'){
                this[to].push(this[from].splice(index,1)[0]);
              }
              else if (place === 'top'){
                this[to].unshift(this[from].splice(index,1)[0]);
              }
          });
        }
        let data = {};
        data[from] = this[from];
        data[to] = this[to];
        this.socket.emit("statusUpdate", data);
    }

    trash(amount,from){
      let room = rooms[this.room];
      console.log("in trash cards");
        if(amount == 'all'){
            this[from].forEach( card => {
            sendRep(this.socket,this,`${this.socket.username}废弃了${card.chname}`);
                if(card.vp !== undefined){
                    this.vp -= card.vp;
                }
                for(let cardid in this.onLost){
                  let eff = this.onLost[cardid];
                  eff.func(this, exFunctions, eff.from, card);
                }
                if(card.onTrash !== undefined && !card.onTrash(this,exFunctions)) return;//mokou
                delete this.onGain[card.id];
                delete this.onLost[card.id];
            });
            room.trash = room.trash.concat(this[from]);
            this[from] = [];
        }
        else if(Array.isArray(amount)){
          console.log(amount);
          let myamount = amount.slice();
          myamount.sort( (a,b) => a<b );
          myamount.forEach( index =>{
              console.log(index, this[from][index].chname, this[from][index].no,this[from][index].vp,this.vp);
              let card = this[from][index];
              if(typeof(this[from][index].vp) !== "undefined"){
                this.vp -= this[from][index].vp;
              }
              if(card.onTrash !== undefined && !card.onTrash(this,exFunctions)) return;//mokou
              sendRep(this.socket,this,`${this.socket.username}废弃了${card.chname}`);
              delete this.onGain[card.id];
              delete this.onLost[card.id];
              for(let cardid in this.onLost){
                let eff = this.onLost[cardid];
                console.log(`in ${eff.from.chname} onLost`);
                eff.func(this, exFunctions, eff.from, card);
              }
              room.trash.push(this[from].splice(index, 1)[0]);
          });
        }

    }

    async showCard(amount, from = 'hand'){
        let room = rooms[this.room];
        console.log("in show card");
        console.log(from,this[from]);
        if(amount === 'all'){
          await this[from].forEach(card =>{
            card.shown = true;
            sendRep(this.socket,this,`${this.socket.username}展示了${card.chname}`);
          });
        }
        if(Array.isArray(amount)){
        await amount.forEach( index =>{
              console.log(index, this[from][index].chname, this[from][index].no);
              let card = this[from][index];
              card.shown = true;
              sendRep(this.socket,this,`${this.socket.username}展示了${card.chname}`);
          });
        }
    }

    async attacked(from){
      console.log("on attacked of " + this.socket.username);
      for(let cardid in this.duration){
        let card = this.duration[cardid];
        if(typeof(card.onAttack) !== 'function') continue;
        await eff.func(this, exFunctions, card, from);
      }
      for(let cardid in this.hand){
        let card = this.hand[cardid];
        if(typeof(card.onAttack) !== 'function') continue;
        await card.onAttack(this, exFunctions, card, from);
      }
      console.log("attack finished of " + this.socket.username);
    }
}

class Card{
    constructor(props){
        this.expansion = props.expansion || "";
        this.number = props.number || 0;
        this.no = props.no || 0;
        this.id = props.id || -1;
        this.src = props.src || '';
        this.index = props.index || -1;
        this.used = props.used || false;
        this.amount = props.amount || 0;
        this.shown = props.shown || false;
        this.chosen = props.chosen || false;
    }
}

class DomCard extends Card{
    constructor(props){
        super(props);
        this.chname = props.chname || '' ;
        this.janame = props.janame || '' ;
        this.enname = props.enname || '' ;
        this.expansion = props.expansion || '' ;
        this.types = props.types || [] ;
        this.cost = props.cost || 0 ;
        this.cheffect = props.cheffect || '' ;
        this.jaeffect = props.jaeffect || '' ;
        this.eneffect = props.eneffect || '' ;
        this.chspecial = props.chspecial || '' ;
        this.jaspecial = props.jaspecial || '' ;
        this.enspecial = props.enspecial || '' ;
        this.remark = props.remark || '' ;
        this.stage = props.stage || '' ;
        this.vp = props.vp || 0 ;
        this.use = props.use || undefined ;
        this.onGain = props.onGain || undefined;
        this.onAttack = props.onAttack || undefined;
        this.onTrash = props.onTrash || undefined;
    }
}

function generateCard(room, limit, type){
  // global cardData
    let randarr = [];
    room.cardArray = [];

    cardData.forEach( (array, index) => {
      array.forEach((info, i) => {
          if(room.noin[index].includes(i + 1)
          || type === 'available' && typeof(info.use) === 'undefined'){
              return;
          }
          let card = new Card({
              expansion: info.expansion,
              number: i + 1,
              src: 'supply',
          });
          room.cardArray.push(card);
      });
    });

    room.cardArray.shuffle();
    limit = Math.min(limit, room.cardArray.length);
    randarr = room.cardArray.slice(0, limit);
    room.supply = ['a'];// f**k jsArray
    getCard(room.supply, randarr, limit);
};

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
              console.log(target[i].chname,i);
              break;
          }
        }
    }
}

function changeCard(room, limit, index){
    let randarr = [];
    room.cardArray[room.cardArray.length] = room.cardArray[index];
    room.cardArray.shuffle(limit);
    room.cardArray[index] = room.cardArray[room.cardArray.length - 1];
    room.cardArray.splice(room.cardArray.length - 1, 1);
    randarr = room.cardArray.slice(0,limit);
    getCard(room.supply,randarr,limit,index);
};

// emit: startgame, statusUpdate
function initialGame(roomNum){
    console.log(`${new Date().toLocaleString()} game in room#${roomNum} started`);
    let room = rooms[roomNum];
    room.paging = "battle";


    // change basic card total by players.length
    if(Object.keys(room.users).length == 2){
        room.basicTotal[4] = 8;
        room.basicTotal[5] = 8;
        room.basicTotal[6] = 10;
    }
    else if(Object.keys(room.users).length == 3){
        room.basicTotal[3] = 21;
        room.basicTotal[6] = 20;
    }
    else{
        room.basicTotal[3] = 12 + 3 * Object.keys(room.users).length;
    }
    room.basicRemain = room.basicTotal.slice();
    room.supplyTotal = [];
    for(let i = room.supply.length - 1; i >= 0; i -= 1){
      if(!room.supply[i].types.includes('胜利点')){
        room.supplyTotal[i] = 10;
      }
      else {
        room.supplyTotal[i] = 8;
      }
    }
    room.supplyRemain = room.supplyTotal.slice();
    // get basic cards
    let tmp = [];
    room.basic.forEach((number)=>{
        tmp.push({
            expansion: "基础牌",
            number: number,
            src:'basic',
        });
    });
    getCard(room.basic, tmp, tmp.length);
    for(let socket of room.sockets){
        socket.emit('startGame',{
            page: pages[1],
            supply: room.supply,
            basic: room.basic
        });
    }

    // gain start card
    for(let userName in room.users){
        let user = room.users[userName];
        for(let cardkey in room.startCards){
            let card = room.startCards[cardkey];
            for(let i = 0;i < card.amount;i += 1){
                user.gainCard("deck", "basic", card.number - 1);
            }
        }
        user.deck.shuffle();
        user.draw(5);
        room.users[userName] = user;
    }

    // make player order
    room.userOrder = Object.keys(room.users);
    room.userOrder.shuffle();
    room.nowPlayer = room.userOrder[room.nowPlayerPoint];
    room.nowStage = 0;
    room.vps = [];
    room.userOrder.forEach((userkey) => {
        room.vps.push(room.users[userkey].vp);
    });

    room.show();
    for(let socket of room.sockets){
        console.log(socket.username);
        socket.paging = "battle";
        socket.emit("statusUpdate",{
            supplyRemain: room.supplyRemain,
            basicRemain: room.basicRemain,
            usersName: room.userOrder,
            userPoint: room.vps,
            nowPlayer: room.nowPlayer,
            nowStage: stage[room.nowStage % 3],
            hand: room.users[socket.username].hand,
            cardsLength: room.users[socket.username].deck.length,
            nowAction: 1,
            nowMoney: 0,
            nowBuy: 1,
            nowCard: 5,
            nowTurn: 1,
        });
    }
}

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
          drops: user.drops,
          aCardUsing: user.aCardUsing,
          hand: user.hand,
          nowTurn: parseInt(room.nowStage / (3 * Object.keys(room.users).length) + 1)
      });
      socket.to(socket.room).emit("statusUpdate",{
          supplyRemain: room.supplyRemain,
          basicRemain: room.basicRemain,
          otherVp: user.vp,
          oneName: socket.username,
          nowTurn: parseInt(room.nowStage / (3 * Object.keys(room.users).length) + 1)
      });
  }
}

function endGame(roomNum){
    let room = rooms[roomNum];
    console.log(`${new Date().toLocaleString()} game in room#${roomNum} ended`);
    for(let socket of room.sockets){
      socket.emit("end game");
      socket.paging = "waiting";
    }
    room.paging = "waiting";

    rooms[roomNum] = new Room({});
}
function sendRep(socket,user,content){
  socket.emit("sendRep",{
    content: content,
  });
  socket.to(socket.room).emit("sendRep",{
    content: content,
  });
}
var exFunctions = {//globals
  ask:ask,
  generalStatus:generalStatus,
  sendRep:sendRep,
  rooms:rooms,
};

function registering(data){
    //socket.paging
    if(this.paging !== 'login') return;
    this.emit('registered',{
        valid: false,
        errorcode: 1
    });
    return;
}

io.on('connection',(socket) =>{
    // socket.username
    // socket.paging
    // socket.room
    // socket.asking
    socket.paging = "login"; // login, waiting, battle
    socket.room = -1;
    socket.asking = false;

    console.log(`${new Date().toLocaleString()} a user connected`);

    // now unavailable
    socket.on('register', registering);

    /* two types: log in and change room
     * data: username, password, room, type{new, change}
     * emit: userjoined, verified, otherReady, generateCard
     */
    socket.on('verifyWaiting',(data) => {
        // socket.username
        // socket.paging
        // socket.room
        // rooms[],unlogUserList[],userList
        if(typeof(data) != "object"
        || ( rooms[data.room.toString()] !== undefined
          && rooms[data.room.toString()].host !== undefined
          && rooms[data.room.toString()].paging === "battle")
        || data.room >= ROOMAMOUNT ){
                socket.emit('verified',{
                    valid: false,
                    errorcode: 1,
                    from: data.type,
                });
                return;
        }
        if(data.type === "new"){//log in
            if(socket.paging != 'login') return;

            console.log(`${new Date().toLocaleString()} attempt to login: ${data.username}`);
            console.log(`inputed password: ${data.password}`);
            console.log(`valid password: ${userList[data.username]}`);
            if(unlogUserList.includes(data.username)
               && data.password === userList[data.username]){
                   unlogUserList.remove(data.username);
            }// check if valid
            else { // login failed
                socket.emit('verified',{
                    valid: false,
                    errorcode: 2
                });
                return;
            }

            console.log(`${data.username} logged in`);

            socket.username = data.username;
            socket.paging = 'waiting';
        }
        else if(data.type === "change"){
            socket.leave(socket.room);
            delete rooms[socket.room].users[socket.username];
            rooms[socket.room].sockets.remove(socket);
            socket.to(socket.room).emit('user left',{
                username: socket.username,
            });
            if(Object.keys(rooms[socket.room].users).length === 0){
                delete rooms[socket.room];
            }
            console.log(`${new Date().toLocaleString()} ${socket.username} changed room from ${socket.room} to ${data.room.toString()}`);
        }
        else return;

        socket.room = data.room.toString();
        socket.join(socket.room);
        if(rooms[socket.room] === undefined
          || rooms[socket.room].users === undefined
          || Object.keys(rooms[socket.room].users).length === 0
          || rooms[socket.room].host === undefined){ // initialize
            rooms[socket.room] = new Room({host:socket.username});
        }
        let room = rooms[socket.room];
        room.users[socket.username] = new User({status:"waiting",room:socket.room,socket:socket});
        room.sockets.push(socket);

        room.show();
        socket.to(socket.room).emit('user joined',{
            username: socket.username,
        });

        socket.emit('verified',{
            valid: true,
            users: Object.keys(room.users),
            page: data.type === "new"? pages[0] : undefined,
            roomhost: rooms[socket.room].host
        });

        for(let user in room.users)
            socket.emit('otherReady',{
                name: user,
                prepared: room.users[user].status === 'prepared',
                already: false
            });

        if(room.supply !== undefined){
            socket.emit('generateCard',room.supply);
        }
    });

    socket.on('generateCard',(data) => { // emit generateCard
        if(rooms[socket.room].paging !== "waiting") return;
        if(socket.username !== rooms[socket.room].host){
            return;
        }

        console.log(`${new Date().toLocaleString()} room#${socket.room} sending card..`);
        if(data.index !== undefined){
            changeCard(rooms[socket.room], data.limit, data.index);
        }
        else{
            generateCard(rooms[socket.room], data.limit, data.type);
        }
        for(let user in rooms[socket.room].users){
              user.status = "waiting";
        }
        socket.emit('generateCard',rooms[socket.room].supply);
        socket.to(socket.room).emit('generateCard',rooms[socket.room].supply);
    });

    socket.on('ready',(prepared) => { //emit otherReady, startGame
        if(rooms[socket.room].paging !== "waiting" || prepared === undefined) return;
        let room = rooms[socket.room];
        let user = room.users[socket.username];
        let ppusers = 0;// prepared users
        if(socket.username !== room.host){
            if(user.status === 'waiting')
                user.status = 'prepared';
            else user.status = 'waiting';
        }

        for(let userName in room.users){
            ppusers += room.users[userName].status === 'prepared' ? 1 : 0;
        }

        if(socket.username === room.host){
          if(Object.keys(room.users).length > 1
            && ppusers >= Object.keys(room.users).length - 1
            && room.supply != undefined){
              initialGame(socket.room);
              return;
          }
        }
        socket.to(socket.room).emit('otherReady',{
            name: socket.username,
            prepared: prepared,
            already: ppusers >= Object.keys(room.users).length - 1
        });
    });

    socket.on('nextStage', () => {
        if(socket.paging !== "battle") return;
        let room = rooms[socket.room];
        let user = room.users[socket.username];
        if(socket.username !== room.nowPlayer) return;

        room.nowStage ++;
        // Action
        if(room.nowStage % 3 === 0){
            [user.money, user.action, user.buy, user.actionUsed] = [0, 1, 1, 0];
            room.nowPlayerPoint ++;
            room.nowPlayer = room.userOrder[room.nowPlayerPoint % room.userOrder.length];
            room.users[room.nowPlayer].gained = {supply:[],basic:[]};
        }
        // Buy
        if(room.nowStage % 3 === 1){

        }
        // Cleanup
        if(room.nowStage % 3 == 2){
            user.actionArea.forEach((card,index)=>{
               card.used = false;
            });
            user.drop('all','actionArea');
            user.drop('all','hand');
            user.draw(5);
        }
        console.log(`${new Date().toLocaleString()} in room ${socket.room}`);
        console.log(`in stage ${room.nowStage}`);
        console.log(`in player ${room.nowPlayer}`);
        generalStatus(socket, room.nowStage % 3 === 0);
    });

    socket.on('useCard',async (index) => {
        if(socket.paging !== "battle" || index === undefined) return;

        let room = rooms[socket.room];
        let user = room.users[socket.username];
        if(socket.username !== room.nowPlayer
        || user.hand[index] === undefined
        || user.hand[index].used
        || user.aCardUsing) return;
        let usingCard = user.hand[index];
        console.log(`${new Date().toLocaleString()} in room#${socket.room}`);
        console.log("in using card:");
        console.log(usingCard.chname, usingCard.no, usingCard.used);

        if(usingCard.types.includes('行动') && stage[room.nowStage % 3] !== 'Action'
        || usingCard.types.includes('行动') && user.action < 1
        || usingCard.types.includes('资源') && stage[room.nowStage % 3] !== 'Buy'
        || typeof(usingCard.use) !== "function") return;

        usingCard.used = true;
        user.aCardUsing = true;
        user.actionArea.push(usingCard);
        user.hand.splice(index,1);//affect status update

        if(usingCard.types.includes('行动')) {
          user.action -= 1;
          user.actionUsed ++;
        }
        socket.emit("statusUpdate",{
          usingCard: usingCard,
          nowAction:user.action,
        });
        socket.to(socket.room).emit("statusUpdate",{
          usingCard: usingCard,
          nowAction:user.action,
        });

        await usingCard.use(user,exFunctions,usingCard);

        console.log("used");

        user.aCardUsing = false;
        generalStatus(socket);
    });

    socket.on('buyCard',async (data) =>{
        if(socket.paging !== "battle" || data === undefined
        || data.src !== "supply" && data.src !== "basic") return;
        let room = rooms[socket.room];
        let user = room.users[socket.username];
        let index = data.index;
        let src = data.src;
        if(socket.username != room.nowPlayer) return;

        if(room[src][index] === undefined
        || user.money < room[src][index].cost
        || user.buy < 1
        || room[src + "Remain"][index] < 1) return;
        user.money -= room[src][index].cost;
        user.buy -= 1;

        console.log(`${new Date().toLocaleString()} in room ${socket.room}`);
        console.log("in buying Card");
        await user.gainCard("drops", src, index,'buy');
    });

    socket.on('disconnect', () => { //emit userleft
        console.log(new Date().toLocaleString());
        if(socket.paging === 'login'){
            console.log('a user disconnected');
        }
        else{
            let room = rooms[socket.room];
            console.log(socket.username + ' disconnected');
            if(socket.paging === 'battle'){
                endGame(socket.room);
            }
            rooms[socket.room].sockets.remove(socket);
            socket.leave(socket.room);
            delete rooms[socket.room].users[socket.username];
            if(rooms[socket.room].host === socket.username){
                rooms[socket.room].host = Object.keys(rooms[socket.room].users)[0];
            }
            room.show();
            unlogUserList.push(socket.username);
            socket.to(socket.room).emit('user left',{
                username: socket.username
            });
        }
    });

 });
