"use strict";

var g = require(__dirname+'/global.js');
var DomCard = require(__dirname+'/card.js').DomCard;
var rooms = g.rooms;
var generalStatus = g.generalStatus;
var sendRep = g.sendRep;

class User{
    constructor(props){
        this.socket = props.socket || '';
        this.room = props.room || "";
        this.state = props.state || "waiting"; //waiting, prepared, gaming,  watching
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
        this.onDrop = prpos.onDrop || {};
        this.cardAmount = props.cardAmount || 0;
        this.temp = props.temp || [];
        this.gained = props.gained || {supply:{},basic:{}};//src:{index:type}
        this.extraTurn = props.extraTurn || false;//398
    }

    async gainCard(to, src, index, type, place = 'bottom'){
        let room = rooms[this.room];
        if(room[src + "Remain"][index] <= 0) return;
        let card = new DomCard(room[src][index]);
       for(let cardid in this.beforeGain){
          let eff = this.beforeGain[cardid];
          if(await eff.func(this, eff.from, card,to) === false) return;//youmei gumi
        }
        card.no = room[src + "Total"][index] - room[src + "Remain"][index] + 1;
        card.id = (src === 'basic' ? 20 : 0) * 100000 + index * 100 + card.no;
        card.index = index;
        card.src = src;
        room[src + "Remain"][index] -= 1;
        if(type !== undefined){
          console.log("in gain card");
          console.log(card.name.ch, card.vp, this.money, card.cost, card.index);
        }
        if(card.vp !== undefined){
            this.vp += card.vp;
        }

        //affect ongain effects
        if(card.onGain !== undefined){
          console.log("in card.ongain");
           await card.onGain(this,card);
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
          await eff.func(this,  eff.from, card,to);
        }

        // send content
        if(type !== undefined){
          let content = type === 'buy'
          ? `${this.socket.username} 购买了 ${room[src][index].name.ch}`
          : type === 'gain'
          ? `${this.socket.username} 获得了${card.name.ch}` : undefined ;
          generalStatus(this.socket);
          sendRep(this.socket, this, content);
          this.gained[src][index] = type;
        }
        // judge if game end
        if(room[src + "Remain"][index] === 0){
              if(room.basicRemain[5] === 0 || room.usedup() >= 3) {
                room.endGame();
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
        console.log(`amount:${amount} length:${this.deck.length}`,this.hand.length);
        if(this.deck.length < amount){
            this.drops.shuffle();
            this.deck = this.deck.concat(this.drops);
            this.drops = [];
        }
        return this.deck.slice(0,amount);
    }
    draw(amount){
        console.log("in usr.draw");
        this.find(amount);
        this.hand = this.hand.concat(this.deck.splice(0,amount));
        this.socket.emit("statusUpdate", {
              hand: this.hand,
        });
    }

    drop(amount, from, to = 'drops', place = 'bottom'){
      console.log("in usr.drop");
      console.log(amount,from,to,place);
        if(amount == 'all'){
            this[to] = this[to].concat(this[from]);
            this[from] = [];
        }
        else if(Array.isArray(amount)){
          let myamount = amount.slice();
          myamount.sort((a,b)=>{return a<b;});
          myamount.forEach((index) =>{
              console.log(index, this[from][index].name.ch, this[from][index].no);
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
        data.hand = this.hand;
        this.socket.emit("statusUpdate", data);
    }

    trash(amount,from){
      let room = rooms[this.room];
      console.log("in trash cards");
        if(amount == 'all'){
            this[from].forEach( card => {
            sendRep(this.socket,this,`${this.socket.username}废弃了${card.name.ch}`);
                if(card.vp !== undefined){
                    this.vp -= card.vp;
                }
                for(let cardid in this.onLost){
                  let eff = this.onLost[cardid];
                  eff.func(this,  eff.from, card);
                }
                if(card.onTrash !== undefined && !card.onTrash(this)) return;//mokou
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
              console.log(index, this[from][index].name.ch, this[from][index].no,this[from][index].vp,this.vp);
              let card = this[from][index];
              if(typeof(this[from][index].vp) !== "undefined"){
                this.vp -= this[from][index].vp;
              }
              if(card.onTrash !== undefined && !card.onTrash(this)) return;//mokou
              sendRep(this.socket,this,`${this.socket.username}废弃了${card.name.ch}`);
              delete this.onGain[card.id];
              delete this.onLost[card.id];
              for(let cardid in this.onLost){
                let eff = this.onLost[cardid];
                console.log(`in ${eff.from.name.ch} onLost`);
                eff.func(this, eff.from, card);
              }
              room.trash.push(this[from].splice(index, 1)[0]);
          });
        }

    }

    async showCard(amount, from = 'hand'){
        let room = rooms[this.room];
        console.log("in show card");
        console.log(from,this[from]);
        let showCards = [];
        if(amount === 'all'){
          showCards = this[from];
        }
        if(Array.isArray(amount)){
          showCards = amount.map(index => {
            console.log(index, this[from][index].name.ch, this[from][index].no);
            return this[from][index];
          });
        }
        if(Number.isInteger(amount)){
          showCards = this.find(amount);
        }
        await showCards.forEach(card => {
          card.shown = true;
          sendRep(this.socket,this,`${this.socket.username}展示了${card.name.ch}`);
        });
    }

    async attacked(from){
      console.log("on attacked of " + this.socket.username);
      for(let cardid in this.duration){
        let card = this.duration[cardid];
        if(typeof(card.onAttack) !== 'function') continue;
        await card.onAttack(this, card, from);
      }
      for(let cardid in this.hand){
        let card = this.hand[cardid];
        if(typeof(card.onAttack) !== 'function') continue;
        await card.onAttack(this, card, from);
      }
      console.log("attack finished of " + this.socket.username);
    }
    globalCard (){
      return [].concat(this.hand,this.actionArea,this.drops,this.duration,this.temp);
    }
}
module.exports = User;
