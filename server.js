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
  console.log(new Date().toLocaleTimeString() + ' listening on *:443');
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
        this.users = props.users || {};
        this.userorder = props.userorder || []; //人物顺序
        this.trash = props.trash || [];
        this.host = props.host || undefined;
        this.cards = props.cards || [];
        this.noin = props.noin || [[],[],[26,27,28,29,30],[],[19,20,21],[],[1,2,3,4,5,6,7]];
        this.cardArray = props.cardArray || [];
        this.lens = props.lens || []; //lengths of each expansions
        this.cardsStartAmount = props.cardsStartAmount || [12,12,12,12,12,12,12,12,12,12];
        this.cardsAmount = props.cardsAmount || [12,12,12,12,12,12,12,12,12,12];
        this.basicCards = props.basicCards || [1,2,3,4,5,6,7];
        this.basicCardsStartAmount = props.basicCardsStartAmount || [60,40,30,14,12,12,30];
        this.basicCardsAmount = props.basicCardsAmount || [60,40,30,14,12,12,30];
        this.startCards = props.startCards || [];
        this.isStart = props.isStart || false;
        this.nowPlayer = props.nowPlayer || "";
        this.nowPlayerPoint = props.nowPlayerPoint || 0;
        this.nowStage = props.nowStage || 0;
    }
}

class User{
    constructor(props){
        this.status = props.status || "waiting"; //waiting, prepared, gaming,  watching
        this.cardsInHand = props.cardsInHand || [];
        this.cards = props.cards || [];
        this.drops = props.drops || [];
        this.actionArea = props.actionArea || [];
        this.money = props.money || 0;
        this.vp = props.vp || 0;
        this.action = props.action || 1;
        this.buy = props.buy || 1;
    }
}

class Card{
    constructor(props){
        this.expansion = props.expansion || "";
        this.number = props.number || 0;
        this.no = props.no || 0;
        this.used = props.used || false;
        this.amount = props.amount || 0;
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

function showRoom(room){//in console.log
    console.log(new Date().toLocaleTimeString() + ' ' +  "users in room#" + room + " are:{name,prepared}");
    console.log(Object.keys(rooms[room].users));
    statuses = [];
    for(username in rooms[room].users){
        statuses.push(rooms[room].users[username].status);
    }
    console.log(statuses);
    console.log("roomhost is " + rooms[room].host);
}

function generateCard(room,limit,type){
    var randarr=[];
    room.cardArray=[];

    cardData.forEach(function(array,index){

        for(var i=0;i<array.length;i++){
            if(room.noin[index].indexOf(i+1)!=-1
            || type == 'available' && typeof(array[i].use) != 'function'){
                continue;
            }
            var card = new Card({
                expansion: array[i].expansion,
                number: i+1,
            });
            room.cardArray.push(card);
        }
    });

    room.cardArray.shuffle();
    randarr = room.cardArray.slice(0,limit);
    room.cards=['a'];/// f**k jsArray
    getCard(room.cards,randarr,limit);
};

function getCard(target,src,limit,index){
    if(target == undefined || target[0] == undefined){
        target=[];
        index = undefined;
    }
    console.log(new Date().toLocaleTimeString() + ' ' +  "in getCard");
    console.log(src,limit,index);
    for(var i=0;i<limit;i++){
        if(index != undefined && index != i) continue;
        for(var j=0;j<cardData.length;j++){
            if(cardData[j][0].expansion == src[i].expansion){
                target[i] = [];
                Object.assign(target[i],src[i],cardData[j][src[i].number-1]);
                target[i] = new DomCard(target[i]);
               // console.log(target[i]);
                break;
            }
        }
    }
};

function changeCard(room,limit,index){
    var randarr = [];
    console.log(index,limit);
    room.cardArray[room.cardArray.length] = room.cardArray[index];
    var tmp = room.cardArray.slice(limit);
    tmp.shuffle();
    room.cardArray[index] = tmp[tmp.length-1];
    randarr = room.cardArray.slice(0,limit);
    room.cardArray = randarr.concat(tmp.slice(0,tmp.length-1));

    getCard(room.cards,randarr,limit,index);
};

function initialGame(room,socket){
    console.log(new Date().toLocaleTimeString() + ' ' +  "game in room#" + room + " started");
    rooms[room].isStart = true;
    socket.emit('startGame',{
        page: pages[1],
        card: rooms[room].card
    });
    socket.to(room).emit('startGame',{
        page: pages[1],
        card: rooms[room].card
    });

    if(Object.keys(rooms[room].users).length == 2){
        rooms[room].cardsStartAmount.forEach((v,i) => {
            if(v == 12)
                rooms[room].cardsStartAmount[i] = 8;
        });
        rooms[room].basicCardsStartAmount.forEach((v,i) => {
            if(v == 12)
                rooms[room].basicCardsStartAmount[i] = 8;
        });
        rooms[room].basicCardsStartAmount[6] = 10;
    }
    else if(Object.keys(rooms[room].users).length == 3){
        rooms[room].basicCardsStartAmount[3] = 21;
        rooms[room].basicCardsStartAmount[6] = 20;
    }
    else{
        rooms[room].basicCardsStartAmount[3] = 12+3*Object.keys(rooms[room].users).length;
    }
    rooms[room].basicCardsAmount = rooms[room].basicCardsStartAmount.slice();
    rooms[room].cardsAmount = rooms[room].cardsStartAmount.slice();

    rooms[room].startCards = [{
        expansion:"基础牌",
        number:1,
        amount:7
    },{
        expansion:"基础牌",
        number:4,
        amount:3
    }];
    tmp = [];
    rooms[room].basicCards.forEach((number)=>{
        tmp.push({
            expansion: "基础牌",
            number: number,
            no: 0,
            used: false
        });
    });
    getCard(rooms[room].basicCards,tmp,tmp.length);
    for(key in rooms[room].users){
        user = new User({});
        for(cardkey in rooms[room].startCards){
            card = rooms[room].startCards[cardkey];
            for(var i = 0;i < card.amount;i+=1){
                tmp = new DomCard(rooms[room].basicCards[card.number-1]);
                tmp.no = rooms[room].basicCardsStartAmount[card.number-1] - rooms[room].basicCardsAmount[card.number-1] + 1;
                user.cards.push(tmp);
                rooms[room].basicCardsAmount[card.number-1] -= 1;
            }
        }
        user.cards.shuffle();
        for(cardkey in user.cards){
            if(user.cards[cardkey].vp != undefined) user.vp += user.cards[cardkey].vp;
        }
        //↑: initial movements
        user.cardsInHand = user.cards.splice(0,5);
        rooms[room].users[key] = user;
    }
    rooms[room].userorder = Object.keys(rooms[room].users);
    rooms[room].userorder.shuffle();
    rooms[room].nowPlayer = rooms[room].userorder[rooms[room].nowPlayerPoint];
    rooms[room].nowStage = 0;
    rooms[room].userPoint = [];
    rooms[room].userorder.forEach((userkey) => {
        rooms[room].userPoint.push(rooms[room].users[userkey].vp);
    });



    socket.emit("statusUpdate",{
        cardsAmount: rooms[room].cardsAmount,
        basicCardsAmount: rooms[room].basicCardsAmount,
        usersName: rooms[room].userorder,
        userPoint: rooms[room].userPoint,
        nowPlayer: rooms[room].nowPlayer,
        nowStage: stage[rooms[room].nowStage%3],
        nowAction: 1,
        nowMoney: 0,
        nowBuy: 1,
        nowCard: 5,
        nowTurn: 1,
    });
    socket.to(room).emit("statusUpdate",{
        cardsAmount: rooms[room].cardsAmount,
        basicCardsAmount: rooms[room].basicCardsAmount,
        usersName: rooms[room].userorder,
        userPoint: rooms[room].userPoint,
        nowPlayer: rooms[room].nowPlayer,
        nowStage: stage[rooms[room].nowStage%3],
        nowAction: 1,
        nowMoney: 0,
        nowBuy: 1,
        nowCard: 5,
        nowTurn: 1,
    });
}

function dropCards(usr,amount,from){
  console.log("in drop cards");
    if(amount == 'all'){
        usr.drops = usr.drops.concat(usr[from]);
        usr[from] = [];
        console.log(usr.drops);
        console.log(usr[from]);
        return;
    }
    if(typeof(amount) == "object"){
      for(index in amount){
        usr.drops = usr.drops.concat(usr[from].splice(index,1));
      }
      console.log(usr.drops);
      console.log(usr.actionArea);
      console.log(usr[from]);
    }
}

function trashCards(usr,amount,from,room){
  room = rooms[room];
  console.log("in trash cards");
    if(amount == 'all'){
        room.trash = room.trash.concat(usr[from]);
        usr[from] = [];
        console.log(room.trash);
        console.log(usr[from]);
        return;
    }
    if(typeof(amount) == "object"){
      for(index in amount){
        room.trash = room.trash.concat(usr[from].splice(index,1));
      }
      console.log(room.trash);
      console.log(usr.actionArea);
      console.log(usr[from]);
    }
}
function drawCards(usr,amount){
    console.log("in drawCards");
    if(usr.cards.length < amount){
        amount -= usr.cards.length;
        usr.cardsInHand = usr.cardsInHand.concat(usr.cards.slice());
        usr.cards = usr.drops.slice();
        usr.cards.shuffle();
        usr.drops = [];
        usr.cardsInHand = usr.cardsInHand.concat(usr.cards.splice(0,amount));
    }
    else{
        usr.cardsInHand = usr.cardsInHand.concat(usr.cards.splice(0,amount));
    }
}
function askyn(socket,title,content){
  var y;
  console.log('in askyn');
  socket.askingyn = true;
  socket.emit('askyn',{
    title:title,
    content:content,
  });
  return new Promise( (resolve,reject) =>{
      socket.once('sending yn', (yn) =>{
          console.log('in sending yn');
          if(!socket.askingyn || socket.username != room.nowPlayer) return;
          y = yn == 'y';
          console.log('y: '+y);
          resolve(y);
      });
  });
}
//var askyn = askynGenerator();
function endGame(room,socket){
    console.log(new Date().toLocaleTimeString() + ' ' +  "game in room#" + room + " ended");
    socket.emit("end game");
    socket.to(room).emit("end game");
    rooms[room].isStart = false;
    rooms[socket.room] = new Room({});
}
var exFunctions = {
  drawCards:drawCards,
  trashCards:trashCards,
  dropCards:dropCards,
  askyn:askyn,
};

io.on('connection',(socket) =>{
    // socket.username
    // socket.logined
    // socket.room
    // socket.askingyn
    socket.logined = false;
    socket.room = -1;
    socket.askingyn = false;

    console.log(new Date().toLocaleTimeString() + ' ' +  'a user connected');

    // now no register
    socket.on('register',(data) => {
        if(socket.logined) return;
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
        if(rooms[data.room.toString()]!=undefined
        && rooms[data.room.toString()].isStart == true
        && rooms[data.room.toString()].users.length > 0){
                socket.emit('verified',{
                    valid: false,
                    errorcode: 1
                });
                return;
        }
        if(data.type === "new"){//log in
            if(socket.logined) return;

            console.log(new Date().toLocaleTimeString() + ' ' +  "attempt to login: " + data.username);
            console.log("inputed password: " + data.password);
            console.log("valid password: " + userList[data.username]);
            if(data.room < ROOMAMOUNT
               && unlogUserList.indexOf(data.username) != -1
               && data.password == userList[data.username]){
                   unlogUserList.splice(unlogUserList.indexOf(data.username),1);
            }
            else{ // login failed
                socket.emit('verified',{
                    valid: false,
                    errorcode: 1
                });
                return;
            }

            console.log(data.username + ' logged in');

            socket.username = data.username;
            socket.logined = true;
        }
        else if(data.type === "change"){
            if(data.room.toString() >= ROOMAMOUNT) return;
            socket.leave(socket.room);
            delete rooms[socket.room].users[socket.username];
            socket.to(socket.room).emit('user left',{
                username: socket.username,
            });
            console.log(new Date().toLocaleTimeString() + ' ' +  socket.username
            + " changed room from " + socket.room + " to " + data.room.toString());
        }

        socket.room = data.room.toString();
        socket.join(socket.room);
        if(rooms[socket.room] == undefined
          || rooms[socket.room].users == undefined
          || rooms[socket.room].host == undefined){ // initialize
            rooms[socket.room] = new Room({host:socket.username});
        }
        rooms[socket.room].users[socket.username] = new User({status:"waiting"});
        showRoom(socket.room);

        socket.to(socket.room).emit('user joined',{
            username: socket.username,
        });

        socket.emit('verified',{
            valid: true,
            users: rooms[socket.room].users,
            page: data.type === "new"? pages[0] : undefined,
            roomhost: rooms[socket.room].host
        });

        for(user in rooms[socket.room].users)
            socket.emit('otherReady',{
                name: user,
                prepared: rooms[socket.room].users[user].status=='prepared',
                already: false
            });

        if(rooms[socket.room].cards != undefined){
          // console.log(rooms[socket.room].cards);
            socket.emit('generateCard',rooms[socket.room].cards);
        }
    });

    socket.on('generateCard',(data) => { // emit generateCard
        if(!socket.logined) return;
        if(socket.username !== rooms[socket.room].host){
            return;
        }

        console.log(new Date().toLocaleTimeString() + ' ' +  'room#' + socket.room + ' sending card..');
        if(data.index != undefined){
            changeCard(rooms[socket.room],data.limit,data.index);
        }
        else{
            generateCard(rooms[socket.room],data.limit,data.type);
        }
        socket.emit('generateCard',rooms[socket.room].cards);
        socket.to(socket.room).emit('generateCard',rooms[socket.room].cards);
    });

    socket.on('ready',(prepared) => { //emit otherReady, startGame
        if(!socket.logined) return;

        if(rooms[socket.room].users[socket.username].status == 'waiting')
            rooms[socket.room].users[socket.username].status = 'prepared';
        else rooms[socket.room].users[socket.username].status = 'waiting';
        var ppusers = 0;// prepared users
        for(user in rooms[socket.room].users){
            if(rooms[socket.room].users[user].status == 'prepared') ppusers+=1;
        }
        ppusers = (ppusers >= Object.keys(rooms[socket.room].users).length-1);//true:all ready
        ppusers = ppusers && (rooms[socket.room].cards != undefined);

        if(socket.username == rooms[socket.room].host
          && prepared
          && Object.keys(rooms[socket.room].users).length > 1
          && ppusers
          && rooms[socket.room].cards != undefined){
            initialGame(socket.room,socket);
            return;
        }

        socket.to(socket.room).emit('otherReady',{
            name: socket.username,
            prepared: prepared,
            already: ppusers
        });
    });

    socket.on('getCard', () => {
        if(!socket.logined) return;
        socket.emit('receive cards',rooms[socket.room].users[socket.username]);
    });

    socket.on('nextStage', ()=>{
        if(!socket.logined) return;
        room = rooms[socket.room];
        usr = room.users[socket.username];
        if(socket.username != room.nowPlayer) return;

        room.nowStage ++;
        if(room.nowStage % 3 == 0){
            usr.money = 0;
            usr.action = 1;
            usr.buy = 1;

            //dropCards(usr,'all');
            drawCards(usr,5);

            room.nowPlayerPoint ++;
            room.nowPlayer = room.userorder[room.nowPlayerPoint % room.userorder.length];

        }

        if(room.nowStage % 3 == 2){
            usr.actionArea.forEach((card,index)=>{
               card.used = false;
            });
            usr.drops = usr.drops.concat(usr.actionArea,usr.cardsInHand);
            usr.actionArea = [];
            usr.cardsInHand = [];
        }
        console.log(new Date().toLocaleTimeString() + ' ' +  " in room "+socket.room);
        console.log("in stage " + room.nowStage);
        console.log('in player ' + room.nowPlayer);
        socket.emit("statusUpdate",{
            nowPlayer: room.nowPlayer,
            nowStage: stage[room.nowStage%3],
            nowMoney: room.users[room.nowPlayer].money,
            nowCard: room.users[room.nowPlayer].cardsInHand.length,
            nowAction: room.users[room.nowPlayer].action,
            nowBuy: room.users[room.nowPlayer].buy,
            drops: usr.drops,
            nowTurn: parseInt(room.nowStage/(3*Object.keys(room.users).length)+1)
        });
        socket.to(socket.room).emit("statusUpdate",{
            nowPlayer: room.nowPlayer,
            nowStage: stage[room.nowStage%3],
            nowMoney: room.users[room.nowPlayer].money,
            nowCard: room.users[room.nowPlayer].cardsInHand.length,
            nowAction: room.users[room.nowPlayer].action,
            nowBuy: room.users[room.nowPlayer].buy,
            nowTurn: parseInt(room.nowStage/(3*Object.keys(room.users).length)+1)
        });
    });

    socket.on('useCard',async (index)=>{
        if(!socket.logined) return;
        room = rooms[socket.room];
        if(socket.username != rooms[socket.room].nowPlayer
        || rooms[socket.room].users[socket.username].cardsInHand[index] == undefined) return;
        usr = rooms[socket.room].users[socket.username];
        usingCard = rooms[socket.room].users[socket.username].cardsInHand[index];
        console.log(new Date().toLocaleTimeString() + ' ' +  " in room "+socket.room);
        console.log("in using card:");
        console.log(usingCard.chname,usingCard.no,usingCard.used);
        if(usingCard == undefined || usingCard.used)return;
        if(usingCard.type == '行动' && stage[rooms[socket.room].nowStage%3] != 'Action'
        || usingCard.type == '资源' && stage[rooms[socket.room].nowStage%3] != 'Buy'
        || typeof(usingCard.use) != "function") return;
        if(usingCard.type == '行动' && rooms[socket.room].users[socket.username].action < 1)return;
        usingCard.used = true;
        rooms[socket.room].users[socket.username].actionArea.push(usingCard);
        rooms[socket.room].users[socket.username].cardsInHand.splice(index,1);//affect status update

        rooms[socket.room].users[socket.username] = await usingCard.use(rooms[socket.room].users[socket.username],exFunctions,socket);
        console.log('used');
        if(usingCard.type == '行动') room.users[room.nowPlayer].action--;
        socket.emit("statusUpdate",{
            nowMoney: room.users[room.nowPlayer].money,
            nowCard: room.users[room.nowPlayer].cardsInHand.length,
            nowAction: room.users[room.nowPlayer].action,
            nowBuy: room.users[room.nowPlayer].buy,
            nowCard: room.users[room.nowPlayer].cardsInHand.length,
            drops: usr.drops,
            usingCard: usingCard,
        });
        socket.to(socket.room).emit("statusUpdate",{
            nowMoney: room.users[room.nowPlayer].money,
            nowCard: room.users[room.nowPlayer].cardsInHand.length,
            nowAction: room.users[room.nowPlayer].action,
            nowBuy: room.users[room.nowPlayer].buy,
            usingCard: usingCard,
        });
    });

    socket.on('buyCard',(index) =>{
        if(!socket.logined) return;
        room = rooms[socket.room];
        usr = room.users[socket.username];
        if(socket.username != room.nowPlayer) return;
        buyingCard = index < room.cards.length ? room.cards[index] : room.basicCards[index - room.cards.length];
        no = (index < room.cards.length
          ? room.cardsStartAmount[index] - room.cardsAmount[index]
          : room.basicCardsStartAmount[index - room.cards.length] - room.basicCardsAmount[index - room.cards.length]) + 1;
        if(buyingCard == undefined
        || usr.money < buyingCard.cost
        || usr.buy < 1
        || (index < room.cards.length ? room.cardsAmount[index] : room.basicCardsAmount[index - room.cards.length]) < 1) return;
        usr.money -= buyingCard.cost;
        usr.buy --;
        buyingCard = new DomCard(buyingCard);
        buyingCard.no = no;
        (index < room.cards.length ? (room.cardsAmount[index]--):(room.basicCardsAmount[index - room.cards.length]--));
        console.log(new Date().toLocaleTimeString() + ' ' +  " in room "+socket.room);
        console.log("in buying Card");
        console.log(buyingCard.chname,buyingCard.no,buyingCard.vp);
        console.log(usr.money,buyingCard.cost);
        if(buyingCard.vp != undefined){
            usr.vp += buyingCard.vp;
        }
        usr.drops.push(buyingCard);


        socket.emit("statusUpdate",{
            cardsAmount: room.cardsAmount,
            basicCardsAmount: room.basicCardsAmount,
            drops: usr.drops,
            nowMoney: usr.money,
            nowBuy: usr.buy,
            nowVp: usr.vp,
            buyed: buyingCard.chname,
        });
        socket.to(socket.room).emit("statusUpdate",{
            cardsAmount: room.cardsAmount,
            basicCardsAmount: room.basicCardsAmount,
            nowMoney: usr.money,
            nowBuy: usr.buy,
            nowVp: usr.vp,
            buyed: buyingCard.chname,
        });

        if(room.basicCardsAmount[5] == 0) {endGame(socket.room,socket);return;}
    });


    socket.on('disconnect', () => { //emit userleft
        console.log(new Date().toLocaleTimeString() + ' ');
        if(!socket.logined)
            console.log('a user disconnected');

        if(socket.logined){
            console.log(socket.username + ' disconnected');
            socket.leave(socket.room);
            delete rooms[socket.room].users[socket.username];
            if(rooms[socket.room].host == socket.username){
                rooms[socket.room].host = Object.keys(rooms[socket.room].users)[0];
            }
            showRoom(socket.room);
            unlogUserList.push(socket.username);
            socket.to(socket.room).emit('user left',{
                username: socket.username
            });
        }
    });


 });

module.exports = {drawCards:drawCards};
