"use strict";
var userList = require(__dirname+'/private/users.js');
var unlogUserList = Object.keys(userList);
var Room = require(__dirname+'/room.js');
var User = require(__dirname+'/user.js');
var g = require(__dirname+'/global.js');
var rooms = g.rooms;
var pages = g.pages;
const stage = g.stage;
const ROOMAMOUNT = g.ROOMAMOUNT;
var generalStatus = g.generalStatus;

function sf(socket){
    // socket.username
    socket.paging = "login"; // login, waiting, battle
    socket.room = -1;
    socket.asking = false;

    console.log(`${new Date().toLocaleString()} a user connected`);

    // now unavailable
    socket.on('register', register);
    /* two types: log in and change room
     * data: username, password, room, type{new, change}
     * emit: userjoined, verified, otherReady, generateCard
     */
    socket.on('verifyWaiting', verify);
    socket.on('generateCard', generate);
    socket.on('ready', onReady);
    socket.on('nextStage', nextStage);
    socket.on('useCard', useCard);
    socket.on('buyCard', buyCard);
    socket.on('disconnect', disconnect);
 }

function register(data){
    //socket.paging
    if(this.paging !== 'login') return;
    this.emit('registered',{
        valid: false,
        errorcode: 1
    });
    return;
}

function verify(data){
    // socket.username
    // socket.paging
    // socket.room
    // rooms[],unlogUserList[],userList
    if(typeof(data) != "object"
    || ( rooms[data.room.toString()] !== undefined
      && rooms[data.room.toString()].host !== undefined
      && rooms[data.room.toString()].paging === "battle")
    || data.room >= ROOMAMOUNT ){
            this.emit('verified',{
                valid: false,
                errorcode: 1,
                from: data.type,
            });
            return;
    }
    if(data.type === "new"){//log in
        if(this.paging != 'login') return;

        console.log(`${new Date().toLocaleString()} attempt to login: ${data.username}`);
        console.log(`inputed password: ${data.password}`);
        console.log(`valid password: ${userList[data.username]}`);
        if(unlogUserList.includes(data.username)
           && data.password === userList[data.username]){
               unlogUserList.remove(data.username);
        }// check if valid
        else { // login failed
            this.emit('verified',{
                valid: false,
                errorcode: 2
            });
            return;
        }

        console.log(`${data.username} logged in`);

        this.username = data.username;
        this.paging = 'waiting';
    }
    else if(data.type === "change"){
        this.leave(this.room);
        delete rooms[this.room].users[this.username];
        rooms[this.room].sockets.remove(this);
        this.to(this.room).emit('user left',{
            username: this.username,
        });
        if(Object.keys(rooms[this.room].users).length === 0){
            delete rooms[this.room];
        }
        console.log(`${new Date().toLocaleString()} ${this.username} changed room from ${this.room} to ${data.room.toString()}`);
    }
    else return;

    this.room = data.room.toString();
    this.join(this.room);
    if(rooms[this.room] === undefined
      || rooms[this.room].users === undefined
      || Object.keys(rooms[this.room].users).length === 0
      || rooms[this.room].host === undefined){ // initialize
        rooms[this.room] = new Room({host:this.username, no: this.room});
    }
    let room = rooms[this.room];
    room.users[this.username] = new User({state:"waiting",room:this.room,socket:this});
    room.sockets.push(this);

    room.show();
    this.to(this.room).emit('user joined',{
        username: this.username,
    });

    this.emit('verified',{
        valid: true,
        users: Object.keys(room.users),
        page: data.type === "new"? pages[1] : undefined,
        roomhost: rooms[this.room].host
    });

    for(let user in room.users)
        this.emit('otherReady',{
            name: user,
            prepared: room.users[user].state === 'prepared',
            already: false
        });

    if(room.supply !== undefined){
        this.emit('generateCard',room.supply);
    }
}

function generate(data){ // emit generateCard
    if(typeof(this.room) === 'undefined' || typeof(rooms[this.room]) === 'undefined')return;
    if(rooms[this.room].paging !== "waiting") return;
    if(this.username !== rooms[this.room].host){
        return;
    }

    console.log(`${new Date().toLocaleString()} room#${this.room} sending card..`);
    if(data.index !== undefined){
        rooms[this.room].changeCard(data.limit, data.index);
    }
    else{
        rooms[this.room].generateCard(data.limit, data.type);
    }
    for(let username in rooms[this.room].users){
          rooms[this.room].users[username].state = "waiting";
    }
    this.emit('generateCard',rooms[this.room].supply);
    this.to(this.room).emit('generateCard',rooms[this.room].supply);
}

function onReady(prepared){ //emit otherReady, startGame
    if(rooms[this.room].paging !== "waiting" || prepared === undefined) return;
    let room = rooms[this.room];
    let user = room.users[this.username];
    if(this.username !== room.host){
        if(user.state === 'waiting')
            user.state = 'prepared';
        else user.state = 'waiting';
    }
    console.log(user.state);
    let ppusers = 0;// prepared users
    for(let userName in room.users){
        ppusers += room.users[userName].state === 'prepared' ? 1 : 0;
    }
    console.log(ppusers);

    if(this.username === room.host){
      if(Object.keys(room.users).length > 1
        && ppusers >= Object.keys(room.users).length - 1
        && room.supply !== undefined){
          room.initialGame();
          return;
      }
    }
    this.to(this.room).emit('otherReady',{
        name: this.username,
        prepared: prepared,
        already: ppusers >= Object.keys(room.users).length - 1
    });
}

async function nextStage(){
    if(this.paging !== "battle") return;
    let room = rooms[this.room];
    let user = room.users[this.username];
    if(this.username !== room.nowPlayer) return;
    console.log("in nextstage");

    room.nowStage ++;
    // Action
    if(room.nowStage % 3 === 0){
        [user.money, user.action, user.buy, user.actionUsed] = [0, 1, 1, 0];
        if(user.extraTurn === true){
            user.extraTurn = 'done';
        }
        else {
            user.extraTurn = false;
            room.nowPlayerPoint ++;
        }
        room.nowPlayer = room.userOrder[room.nowPlayerPoint % room.userOrder.length];
        let np = room.users[room.nowPlayer];
        [np.money, np.action, np.buy, np.actionUsed] = [0, 1, 1, 0];
        room.users[room.nowPlayer].gained = {supply:[],basic:[]};
        room.users[room.nowPlayer].duration.forEach((card) => {
            room.users[room.nowPlayer].actionArea.push(card);
            card.duration(room.users[room.nowPlayer],card);
            np.socket.emit("statusUpdate",{
                usingCard: card,
                nowPlayer: room.nowPlayer,
              });
            np.socket.to(np.socket.room).emit("statusUpdate",{
                usingCard: card,
                nowPlayer: room.nowPlayer,
              });
        });
        room.users[room.nowPlayer].duration = [];
        generalStatus(room.users[room.nowPlayer].socket);
    }
    // Buy
    if(room.nowStage % 3 === 1){

    }
    // Cleanup
    if(room.nowStage % 3 == 2){
       // user.actionArea = user.actionArea.filter(card => typeof(card.duration) === 'undefined');
        user.actionArea.forEach((card,index)=>{
           card.used = false;
        });
        user.drop('all','actionArea');
        user.drop('all','hand');
        if(user.extraTurn === true){
            user.draw(3);
        }
        else {
            user.draw(5);
        };
    }
    console.log(`${new Date().toLocaleString()} in room ${this.room}`);
    console.log(`in stage ${room.nowStage}`);
    console.log(`in player ${room.nowPlayer}`);
    generalStatus(this, room.nowStage % 3 === 0);
}

async function useCard(index){
    if(this.paging !== "battle" || index === undefined) return;

    let room = rooms[this.room];
    let user = room.users[this.username];
    if(this.username !== room.nowPlayer
    || user.hand[index] === undefined
    || user.hand[index].used
    || user.aCardUsing) return;
    let usingCard = user.hand[index];
    console.log(`${new Date().toLocaleString()} in room#${this.room}`);
    console.log("in using card:");
    console.log(usingCard.name.ch, usingCard.no, usingCard.used);

    if(usingCard.types.includes('行动') && stage[room.nowStage % 3] !== 'Action'
    || usingCard.types.includes('行动') && user.action < 1
    || usingCard.types.includes('资源') && stage[room.nowStage % 3] !== 'Buy'
    || typeof(usingCard.use) !== "function") return;

    usingCard.used = true;
    user.aCardUsing = true;
    if(typeof(usingCard.duration) === 'undefined')user.actionArea.push(usingCard);
    user.hand.splice(index,1);//affect state update

    if(usingCard.types.includes('行动')) {
      user.action -= 1;
      user.actionUsed ++;
    }
    this.emit("statusUpdate",{
      usingCard: usingCard,
      nowAction:user.action,
    });
    this.to(this.room).emit("statusUpdate",{
      usingCard: usingCard,
      nowAction:user.action,
    });

    await usingCard.use(user,usingCard);

    console.log("used");

    user.aCardUsing = false;
    generalStatus(this);
}

async function buyCard(data){
    if(this.paging !== "battle" || data === undefined
    || data.src !== "supply" && data.src !== "basic") return;
    let room = rooms[this.room];
    let user = room.users[this.username];
    let index = data.index;
    let src = data.src;
    if(this.username != room.nowPlayer) return;

    if(room[src][index] === undefined
    || user.money < room[src][index].cost
    || user.buy < 1
    || room[src + "Remain"][index] < 1) return;
    user.money -= room[src][index].cost;
    user.buy -= 1;

    console.log(`${new Date().toLocaleString()} in room ${this.room}`);
    console.log("in buying Card");
    await user.gainCard("drops", src, index,'buy');
}

function disconnect(){ //emit userleft
    console.log(new Date().toLocaleString());
    if(this.paging === 'login'){
        console.log('a user disconnected');
    }
    else if(this.paging === 'result'){
        console.log(this.username + ' disconnected');
        unlogUserList.push(this.username);
    }
    else if(this.paging === 'battle'){
        let room = rooms[this.room];
        console.log(this.username + ' disconnected');
        room.endGame();
        room.show();
        unlogUserList.push(this.username);
        this.to(this.room).emit('user left',{
            username: this.username
        });
    }
    else {
        let room = rooms[this.room];
        console.log(this.username + ' disconnected');
        rooms[this.room].sockets.remove(this);
        this.leave(this.room);
        delete rooms[this.room].users[this.username];
        if(rooms[this.room].host === this.username){
            rooms[this.room].host = Object.keys(rooms[this.room].users)[0];
        }
        room.show();
        unlogUserList.push(this.username);
        this.to(this.room).emit('user left',{
            username: this.username
        });
    }
}
module.exports = sf;
