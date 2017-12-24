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
        this.room = props.room || "";
        this.status = props.status || "waiting"; //waiting, prepared, gaming,  watching
        this.hand = props.hand || [];
        this.deck = props.deck || [];
        this.drops = props.drops || [];
        this.actionArea = props.actionArea || [];
        this.money = props.money || 0;
        this.vp = props.vp || 0;
        this.action = props.action || 1;
        this.buy = props.buy || 1;
        this.affact = props.affact || false;//whether affect by attack
        this.aCardUsing = props.aCardUsing || false;
        this.actionUsed = props.actionUsed || 0;
    }

    gainCard(card, to){
        if(card.vp !== undefined){
            this.vp += card.vp;
        }
        this[to].push(card);

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

    draw(amount){
        console.log("in usr.draw");
        console.log("amount:",amount,"length:",this.hand.length);
        if(this.deck.length < amount){
            amount -= this.deck.length;
            this.hand = this.hand.concat(this.deck.slice());
            this.deck = this.drops.slice();
            this.deck.shuffle();
            this.drops = [];
            this.hand = this.hand.concat(this.deck.splice(0,amount));
        }
        else{
            this.hand = this.hand.concat(this.deck.splice(0,amount));
        }
        for(let socket of rooms[this.room].sockets){
            console.log(socket.username);
            if(rooms[this.room].users[socket.username] !== this) continue;
            socket.emit("statusUpdate", {
              hand: this.hand,
            })
        }
    }

    drop(amount, from, to = 'drops', place = 'bottom'){
      console.log("in usr.drop");
        if(amount == 'all'){
            this[to] = this[to].concat(this[from]);
            this[from] = [];
            return;
        }
        if(Array.isArray(amount)){
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
    }

    trash(amount,from){
      let room = rooms[this.room];
      console.log("in trash cards");
        if(amount == 'all'){
            this[from].forEach( card => {
                if(card.vp !== undefined){
                    this.vp -= card.vp;
                }
            });
            room.trash = room.trash.concat(this[from]);
            this[from] = [];
            return;
        }
        else if(Array.isArray(amount)){
          console.log(amount);
          let myamount = amount.slice();
          myamount.sort( (a,b) => a<b );
          myamount.forEach( index =>{
              console.log(index, this[from][index].chname, this[from][index].no);
              if(this[from][index].vp !== undefined){
                this.vp -= this[from][index].vp;
              }
              room.trash.push(this[from].splice(index, 1)[0]);
          });
        }
    }
}

class Card{
    constructor(props){
        this.expansion = props.expansion || "";
        this.number = props.number || 0;
        this.no = props.no || 0;
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
        this.type = props.type || '' ;
        this.type2 = props.type2 || '' ;
        this.type3 = props.type3 || '' ;
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
        this.use = props.use || '' ;
    }
}

function generateCard(room, limit, type){
  // global cardData
    let randarr = [];
    room.cardArray = [];

    cardData.forEach( (array, index) => {
      array.forEach((info, i) => {
          if(room.noin[index].includes(i + 1)
          || type === 'available' && typeof(info.use) != 'function'){
              return;
          }
          let card = new Card({
              expansion: info.expansion,
              number: i + 1,
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
          expansion = cardData[j];
          if(expansion[0].expansion === src[i].expansion){
              target[i] = {};
              Object.assign(target[i], src[i], expansion[src[i].number-1]);
              target[i] = new DomCard(target[i]);
              console.log(target[i].chname);
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

    for(let socket of room.sockets){
        socket.emit('startGame',{
            page: pages[1],
            supply: room.supply
        });
    }

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

    // get basic cards
    let tmp = [];
    room.basic.forEach((number)=>{
        tmp.push({
            expansion: "基础牌",
            number: number,
        });
    });
    getCard(room.basic, tmp, tmp.length);

    // gain start card
    for(let userName in room.users){
        let user = room.users[userName];
        for(let cardkey in room.startCards){
            let card = room.startCards[cardkey];
            for(let i = 0;i < card.amount;i += 1){
                let tmp = new DomCard(room.basic[card.number - 1]);
                tmp.no = room.basicTotal[card.number-1] - room.basicRemain[card.number-1] + 1;
                user.gainCard(tmp, "deck");
                room.basicRemain[card.number-1] -= 1;
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


    for(let socket of room.sockets){
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

function askyn(socket,title,content){
  var y;
  console.log('in askyn');
  socket.askingyn = true;
  generalStatus(socket);
  socket.emit('askyn',{
    title:title,
    content:content,
  });
  return new Promise( (resolve,reject) =>{
      socket.once('sending yn', (yn) =>{
          console.log('in sending yn');
          if(!socket.askingyn || socket.username != rooms[socket.room].nowPlayer) return;
          y = yn == 'y';
          console.log('y: '+y);
          socket.askingyn = false;
          resolve(y);
      });
  });
}
function askCards(socket,title,content,type,amount,from){
    console.log('in askCard');
    socket.askingCard = true;
    generalStatus(socket);
    socket.emit('askCards',{
      title:title,
      content:content,
      amount:amount,
      from:from,
    });
    return new Promise( (resolve,reject) =>{
        socket.once('sending cards', (cards) =>{
            console.log('in sending cards');
            if(!socket.askingCard || socket.username != rooms[socket.room].nowPlayer) return;
            console.log('cards: ',cards);
            if(!Array.isArray(cards)) cards = [];
            if((type === 'equal' || type === 'bt') && cards.length < amount){
                tmpCards = [];
                rooms[socket.room].users[socket.username][from].forEach((e,i)=>{
                    if(!(i in cards)) tmpCards.push(i);
                });
                tmpCards.shuffle();
                cards = cards.concat(tmpCards.slice(0,amount - cards.length));
            }
            if(cards.length > amount){
                cards = cards.slice(0,amount);
            }
            socket.askingCard = false;
            resolve(cards);
        });
    });
}

function generalStatus(socket){
  let room = rooms[socket.room];
  let user = room.users[socket.username];
  socket.emit("statusUpdate",{
      supplyRemain: room.supplyRemain,
      basicRemain: room.basicRemain,
      nowPlayer: room.nowPlayer,
      nowStage: stage[room.nowStage % 3],
      nowMoney: user.money,
      nowCard: user.hand.length,
      nowAction: user.action,
      nowBuy: user.buy,
      nowVp: user.vp,
      drops: user.drops,
      aCardUsing: user.aCardUsing,
      hand: user.hand,
      cardsLength: user.deck.length,
      nowTurn: parseInt(room.nowStage / (3 * Object.keys(room.users).length) + 1)
  });
  socket.to(socket.room).emit("statusUpdate",{
      supplyRemain: room.supplyRemain,
      basicRemain: room.basicRemain,
      nowPlayer: room.nowPlayer,
      nowStage: stage[room.nowStage % 3],
      nowMoney: user.money,
      nowCard: user.hand.length,
      nowVp: user.vp,
      nowAction: user.action,
      nowBuy: user.buy,
      nowTurn: parseInt(room.nowStage / (3 * Object.keys(room.users).length) + 1)
  });
}
function endGame(roomNum){
    let room = rooms[roomNum];
    console.log(`${new Date().toLocaleString()} game in room#${roomNum} ended`);
    for(let socket of room.sockets){
      socket.emit("end game");
      socket.paging = "waiting";
    }
    room.paging = "waiting";
    room = new Room({});
}
function sendRep(socket,user,content){
  socket.emit("sendRep",{
    content: content,
  });
  socket.to(socket.room).emit("sendRep",{
    content: content,
  });
}
var exFunctions = {
  askyn:askyn,
  askCards:askCards,
  generalStatus:generalStatus,
  sendRep:sendRep,
  rooms:rooms,
};

io.on('connection',(socket) =>{
    // socket.username
    // socket.paging
    // socket.room
    // socket.askingyn
    // socket.askingCard
    socket.paging = "login"; // login, waiting, battle
    socket.room = -1;
    socket.askingyn = false;
    socket.askingCard = false;

    console.log(`${new Date().toLocaleString()} a user connected`);

    // now unavailable
    socket.on('register',(data) => {
        //socket.paging
        if(socket.paging !== 'login') return;
        socket.emit('registered',{
            valid: false,
            errorcode: 1
        });
        return;
    });

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
        room.users[socket.username] = new User({status:"waiting",room:socket.room});
        room.sockets.push(socket);

        room.show();
        socket.to(socket.room).emit('user joined',{
            username: socket.username,
        });

        socket.emit('verified',{
            valid: true,
            users: room.users,
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
        if(socket.username != room.nowPlayer) return;

        room.nowStage ++;
        // Action
        if(room.nowStage % 3 === 0){
            [user.money, user.action, user.buy, user.actionUsed] = [0, 1, 1, 0];

            room.nowPlayerPoint ++;
            room.nowPlayer = room.userOrder[room.nowPlayerPoint % room.userOrder.length];
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
        generalStatus(socket);
    });

    socket.on('useCard',async (index) => {
        if(socket.paging !== "battle" || index === undefined) return;

        let room = rooms[socket.room];
        let user = room.users[socket.username];
        if(socket.username !== room.nowPlayer
        || user.hand[index] === undefined
        || user.hand[index].used) return;
        let usingCard = user.hand[index];
        console.log(`${new Date().toLocaleString()} in room#${socket.room}`);
        console.log("in using card:");
        console.log(usingCard.chname, usingCard.no, usingCard.used);

        if(usingCard.type === '行动' && stage[room.nowStage % 3] !== 'Action'
        || usingCard.type === '行动' && user.action < 1
        || usingCard.type === '资源' && stage[room.nowStage % 3] !== 'Buy'
        || typeof(usingCard.use) !== "function") return;

        usingCard.used = true;
        user.aCardUsing = true;
        user.actionArea.push(usingCard);
        user.hand.splice(index,1);//affect status update

        socket.emit("statusUpdate",{
          usingCard: usingCard,
        });
        socket.to(socket.room).emit("statusUpdate",{
          usingCard: usingCard,
        });

        if(usingCard.type == '行动') {
          user.action -= 1;
          user.actionUsed ++;
        }
        user = room.users[socket.username] = await usingCard.use(user,exFunctions,socket);
        console.log('used');

        user.aCardUsing = false;
        generalStatus(socket);
    });

    socket.on('buyCard',(data) =>{
        if(socket.paging !== "battle" || data === undefined
        || data.src !== "supply" && data.src !== "basic") return;
        let room = rooms[socket.room];
        let user = room.users[socket.username];
        let index = data.index;
        let src = data.src;
        if(socket.username != room.nowPlayer) return;

        buyingCard = room[src][index];
        no = room[src + "Total"][index] - room[src + "Remain"][index] + 1;
        if(buyingCard === undefined
        || user.money < buyingCard.cost
        || user.buy < 1
        || room[src + "Remain"][index] < 1) return;
        user.money -= buyingCard.cost;
        user.buy -= 1;
        room[src + "Remain"][index] -= 1;
        buyingCard = new DomCard(buyingCard);
        buyingCard.no = no;

        console.log(`${new Date().toLocaleString()} in room ${socket.room}`);
        console.log("in buying Card");
        console.log(buyingCard.chname, buyingCard.no, buyingCard.vp, user.money, buyingCard.cost);
        user.gainCard(buyingCard, "drops");

        generalStatus(socket);
        sendRep(socket, user, `${room.nowPlayer} 购买了 ${buyingCard.chname}`);

        let usedup = 0;
        room.basicRemain.forEach((val) => {
            if(val === 0) usedup += 1;
        });
        room.supplyRemain.forEach((val) => {
            if(val === 0) usedup += 1;
        });
          if(room.basicRemain[5] === 0 || usedup >= 3) {
            endGame(socket.room);
          return;
        }
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
