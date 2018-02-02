if(typeof(module) == "undefined"){
    module = {};
}
        //number, chname,janame,enname,expansion,type,type2,type3,cost,cheffect,jaeffect,eneffect,chspecial,jaspecial,enspecial,remark,stage
        //^(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)$
        /*{\n\tnumber:$1,\n\tchname:'$2',\n\tjaname:'$3',\n\tenname:'$4',\n\t
        expansion:'$5',\n\ttype:'$6',\n\ttype2:'$7',\n\ttype3:'$8',\n\tcost:'$9',
        \n\tcheffect:'$10',\n\tjaeffect:'$11',\n\teneffect:'$12',\n\tchspecial:'$13',
        \n\tjaspecial:'$14',\n\tenspecial:'$15',\n\tremark:'$16',\n\tstage:'$17'\n},*/
const MAX_INT = 999;
var cardSource=[
    [{
        number:1,
        chname:'华人小姑娘「红美铃」',
        janame:'華人小娘「紅美鈴」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'3',
        cheffect:'购买次数 +1 金钱 +2',
        jaeffect:' +1 カードを購入 +②',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3',
        use:(user) => {
          user.gainBuy(1);
          user.gainMoney(2);
        }
    },{
        number:2,
        chname:'恶魔之妹「芙兰朵露·斯卡雷特」',
        janame:'悪魔の妹「フランドール・スカーレット」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'4',
        cheffect:'购买次数 +1 将你的1张手牌移出游戏。获得那张牌费用+1的金钱。',
        jaeffect:' +1 カードを購入 あなたの手札のカード１枚を廃棄する。そのカードのコストの分の＋①を得る。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex',
        use:async (user,f,that) => {
            user.gainBuy(1);
            let cardkey = await f.ask({
                socket: user.socket,
                title: that.chname,
                content: "请选择要废弃的牌",
                area: "hand",
                min: 1,
                max: 1,
            });
            user.gainMoney(Number(user.hand[cardkey[0]].cost));
            user.trash(cardkey,'hand');
        }
    },{
        number:3,
        chname:'奇术「误导」',
        janame:'奇术「ミスディレクション」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'3',
        cheffect:'手牌 +2　每名玩家选择自己的1张手牌，同时交给左边的玩家。然后你可以将自己的1张手牌移出游戏。',
        jaeffect:' +2 カードを引く　各プレイヤーは、自分の手札のカード１枚を選び、左隣のプレイヤーに同時に渡す。その後、あなたは自分の手札のカード１枚を廃棄してもよい。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'5'
    },{
        number:4,
        chname:'火水木金土符「贤者之石」',
        janame:'火水木金土符「贤者の石」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'4',
        cheffect:'金钱 +2　如果你在这个回合使用了3张（含此卡）以上的行动牌：手牌+1 行动次数+1',
        jaeffect:' +②　あなたがこのターンに（このカードも含めて）３枚以上のアクションを使用している場合：＋１　カードを引く　＋１　アクション',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex',
        use: (user,f) => {
            user.gainMoney(2);
            if(user.actionUsed > 2){
                user.draw(1);
                user.gainAction(1);
            }
        }
    },{
        number:5,
        chname:'奇妙的魔法使「雾雨魔理沙」',
        janame:'奇妙な魔法使い「霧雨魔理沙」',
        enname:'',
        expansion:'红魔乡',
        types:['行动', '攻击'],
        cost:'4',
        cheffect:'除你以外的所有玩家从自己的牌堆上展示2张卡。如果其中有资源卡，你从这2张牌中选择1张移出游戏。你可以获得任意数目的在此处移出游戏的牌。弃置其他所有的牌。',
        jaeffect:'他のプレイヤーは全員、自分の山札の上から２枚のカードを公開する。リソースカードを公開した場合、その中の１枚をあなたが選んで廃棄する。あなたはここで廃棄したのうち好きな枚数を獲得できる。他の公開したカードはすべて捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机'
    },{
        number:6,
        chname:'禁忌「莱瓦汀」',
        janame:'禁忌「レーヴァテイン」',
        enname:'',
        expansion:'红魔乡',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'手牌 +2　除你以外的所有玩家每人获得1张负分牌。',
        jaeffect:' +2 カードを引く　他のプレイヤーは全員、マイナスカードを１枚ずつ獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex',
        use:async (user,f,that)=>{
            user.draw(2);
            let otherUsers = Object.keys(f.rooms[user.room].users)
              .map(key => f.rooms[user.room].users[key])
              .filter(otherUser => !(otherUser.socket.username === user.socket.username));// for ordering
            let promises = otherUsers.map(user => (async (user) => {
              await user.attacked(that);
              if(user.affect){
                await user.gainCard('drops','basic',6,'gain');
              }
              user.affect = true;
            })(user));
            await Promise.all(promises);
        }
    },{
        number:7,
        chname:'恋符「极限火花」',
        janame:'恋符「マスタースパーク」',
        enname:'',
        expansion:'红魔乡',
        types:['行动', '攻击'],
        cost:'4',
        cheffect:'金钱 +2　除你以外的所有玩家将手牌弃置至3张。',
        jaeffect:' +②　他のプレイヤーは全員、手札が３枚になるまでカードを捨て札になる。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机',
        use:async (user,f,that)=>{
            user.gainMoney(2);
            for(let otherUserkey in f.rooms[user.room].users){
                let otherUser = f.rooms[user.room].users[otherUserkey];
                if(otherUser.socket.username === user.socket.username
                || otherUser.hand.length - 3 <= 0) continue;
                await otherUser.attacked(that);
                if(otherUser.affect){
                  let cardkey = await f.ask({
                  	socket: otherUser.socket,
                  	title: that.chname,
                  	content: `请选择要弃置的${otherUser.hand.length - 3}张牌`,
                  	area: "hand",
                  	min: otherUser.hand.length - 3,
                  	max: otherUser.hand.length - 3
                  });
                  otherUser.drop(cardkey,'hand');
                }
                otherUser.affect = true;
            }
        }
    },{
        number:8,
        chname:'小恶魔',
        janame:'小悪魔',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +2 行动次数 +1',
        jaeffect:' +2 カードを引く +1 アクション',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4',
        use:(user,f)=>{
            user.draw(2);
            user.gainAction(1);
        }
    },{
        number:9,
        chname:'红魔馆的女仆「十六夜咲夜」',
        janame:'紅魔館のメイド「十六夜咲夜」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +1 行动次数 +1 购买次数 +1 金钱 +1',
        jaeffect:' +1 カードを引く +1 アクション +1 カードを購入 +①',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'5、6',
        use:(user,f)=>{
            user.draw(1);
            user.gainAction(1);
            user.gainBuy(1);
            user.gainMoney(1);
        }
    },{
        number:10,
        chname:'红魔馆地下室',
        janame:'紅魔館地下室',
        enname:'',
        expansion:'红魔乡',
        types:['胜利点'],
        cost:'4',
        cheffect:'牌堆中每有10张牌，获得1点胜利点。',
        jaeffect:'山札のカード１０枚につき勝利点１を得る。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex',
        use:false,
        vp:0,
        onGain:(user,f,that)=>{
            user.onGain[that.id] = user.onLost[that.id] = {
                from:that,
                func:(user,f,that)=>{
                  if(user.cardAmount / 10 !== that.vp){
                      user.vp -= that.vp;
                      that.vp = Math.floor(user.cardAmount / 10);
                      user.vp += that.vp;
                  }
                }
            };
        },
    },{
        number:11,
        chname:'冻符「完美冻结」',
        janame:'凍符「パーフェクトフリーズ」',
        enname:'',
        expansion:'红魔乡',
        types:['行动', '响应'],
        cost:'2',
        cheffect:'手牌 +2　其他玩家使用攻击牌的时候，你可以在手牌中展示这张牌。若这样做，你不会受到这张攻击牌的效果影响。',
        jaeffect:' +2 カードを引く　他のプレイヤーはアタックアクションを使ったとき、手札からこのカードを公開してもよい。そうした場合、あなたはそのアタックアクションの影響を受けない。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'2',
        use:(user,f)=>{
            user.draw(2);
        },
        onAttack: async (user,f,that,card)=>{
            if(await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: `是否展示${that.chname}并免受${card.chname}攻击影响？`,
            	area:  'yn'
            })){
              user.affect = false;
              await user.showCard([user.hand.indexOf(that)]);
            }
        }
    },{
        number:12,
        chname:'湖上的冰精「琪露诺」',
        janame:'湖上の氷精「チルノ」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'3',
        cheffect:'金钱 +2　你可以立即将你的牌堆全部弃置。',
        jaeffect:' +②　あなたの山札のカードすべてを、即座に捨て札に置くことができる。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'2',
        use:async (user,f,that)=>{
            user.gainMoney(2);
            if(await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "是否弃置牌堆所有牌？",
            	area:  'yn'
            })){
              user.drop('all','deck');
              f.sendRep(user.socket,user,user.socket.username + "弃掉了所有手牌");
            }
        }
    },{
        number:13,
        chname:'衡量信仰的赛钱箱',
        janame:'信仰を量る賽銭箱',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'5',
        cheffect:'将你的手牌抓至7张。用此法抓的行动牌可以放在旁边（不计入7张中。）放在旁边的那些牌在此行动后弃置。',
        jaeffect:'あなたの手札が７枚になるまでカードを引く。この方法で引いたアクションカードを脇に置いてもよい。（７枚には数えない。）脇に置いたカードは、このアクションの後、捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机',
        use:async (user,f,that)=>{
            while(user.hand.length < 7 && user.deck.length + user.drops.length > 0){
                user.draw(1);
                if(user.hand[user.hand.length - 1].types.includes('行动')){
                    if(await f.ask({
                    	socket: user.socket,
                    	title: that.chname,
                    	content: `是否弃置${user.hand[user.hand.length - 1].chname}？`,
                    	area: 'yn'
                    })){
                        f.sendRep(user.socket,user,`${user.socket.username}将${user.hand[user.hand.length - 1].chname}放在一旁`);
                        user.drop([user.hand.length - 1],'hand','temp');
                    }
                    user.drop('all','temp');
                }
            }
        }
    },{
        number:14,
        chname:'彩符「彩光乱舞」',
        janame:'彩符「彩光乱舞」',
        enname:'',
        expansion:'红魔乡',
        types:['行动', '攻击'],
        cost:'4',
        cheffect:'手牌 +1 行动次数 +1　所有玩家（包括你）展示牌堆顶的1张牌，你可以选择弃置这张牌或是放回。',
        jaeffect:' +1 カードを引く +1 アクション　各プレイヤーは（あなたも含む）、自分の山札の一番上のカード公開し、そのカードを捨て札にするかそのまま戻すかをあなたが選ぶ。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3'
    },{
        number:15,
        chname:'神枪「冈格尼尔之枪」',
        janame:'神槍「スピア·ザ·グングニル」',
        enname:'',
        expansion:'红魔乡',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'行动次数 +1　从中选择1项：「金钱+2」；「弃置你的所有手牌，抓4张牌。然后拥有5张以上手牌的全部其他玩家弃置所有手牌，抓4张牌。」',
        jaeffect:' +1 アクション　次のうち１つを選ぶ：「＋②」；「あなたは手札すべてを捨て札にし、＋４カードを引く。そして手札が５枚以上のうちのプレイヤーは全員、自分の手札を捨て札にし、カードを４枚引く。」',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6',
        use:async (user,f,that)=>{
            user.gainAction(1);
            let choices = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择一项：",
            	area: "check",
            	min:  1,
            	max:  1,
              myFilter: ["「金钱+2」", "「弃置你的所有手牌，抓4张牌。然后拥有5张以上手牌的全部其他玩家弃置所有手牌，抓4张牌。」"]
            });
            if(choices[0]) {user.gainMoney(2);f.sendRep(user.socket,user,`金钱+2`);}
            if(choices[1]){
              user.drop('all','hand');
              user.draw(4);
              for(let otherUserkey in f.rooms[user.room].users){
                  let otherUser = f.rooms[user.room].users[otherUserkey];
                  if(otherUser.socket.username === user.socket.username
                  || otherUser.hand.length < 5) continue;
                  await otherUser.attacked(that);
                  if(otherUser.affect){
                    otherUser.drop('all','hand');
                    otherUser.draw(4);
                  }
                  otherUser.affect = true;
              }
              f.sendRep(user.socket,user,`弃置全部手牌`);
            }
        }
    },{
        number:16,
        chname:'大妖精',
        janame:'大妖精',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'3',
        cheffect:'获得1张费用最多为4的牌。',
        jaeffect:'コスト最大④までのカード１枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'2',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要获得的费用最多为4的牌",
            	area: "kingdom",
            	min:  1,
            	max:  1,
              myFilter: (card) => {return card.cost <= 4 ;}
            });
            cardkey = cardkey[0];
            await user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
            console.log(cardkey);
        }
    },{
        number:17,
        chname:'知识与避世的少女「帕秋莉·诺蕾姬」',
        janame:'知識と日陰の少女「パチュリー·ノーレッジ」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'4',
        cheffect:'手牌 +3',
        jaeffect:' +3 カードを引く',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4、ex',
        use:(user,f)=>{
            user.draw(3);
        }
    },{
        number:18,
        chname:'永远鲜红的幼月「蕾米莉亚·斯卡雷特」',
        janame:'永遠に紅い幼き月「レミリア·スカーレット」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +4 购买次数 +1　其他所有玩家抓1张牌。',
        jaeffect:' +4 カードを引く +1 カードを購入　他のプレイヤーは全員、カードを１枚引く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6',
        use:(user,f)=>{
            user.draw(4);
            user.gainBuy(1);
            for(userName in f.rooms[user.room].users){
                if(f.rooms[user.room].users[userName] === user) continue;
                f.rooms[user.room].users[userName].draw(1);
            }
        }
    },{
        number:19,
        chname:'博丽神社的巫女小姐「博丽灵梦」',
        janame:'博麗神社の巫女さん 「博麗霊夢」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'5',
        cheffect:'行动次数 +2 购买次数 +1 金钱 +2',
        jaeffect:' +2 アクション +1 カードを購入　＋②',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机',
        use:(user)=>{
            user.gainAction(2);
            user.gainBuy(1);
            user.gainMoney(2);
        }
    },{
        number:20,
        chname:'魔法之森',
        janame:'魔法の森',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'3',
        cheffect:'手牌 +1 行动次数 +2',
        jaeffect:' +1 カードを引く +2 アクション',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机',
        use:(user,f)=>{
            user.draw(1);
            user.gainAction(2);
        }
    },{
        number:21,
        chname:'迷你八卦炉',
        janame:'ミニ八卦炉',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'4',
        cheffect:'将你的1张手牌移出游戏。获得1张费用最多比此牌多②的牌。',
        jaeffect:'あなたの手札のカード１枚を廃棄する。廃棄したカードよりコストが最大②多いカード１枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title:  that.chname,
            	content:  "请选择要废弃的牌",
            	area:  "hand",
            	min:  1,
            	max:  1
            });
            let cost = Number(user.hand[cardkey[0]].cost) + 2;
            user.trash(cardkey,'hand');
            cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: `请选择要获得的费用最多为${cost}的牌`,
            	area: "kingdom",
            	min: 1,
            	max: 1,
              myFilter: (card) => {return card.cost <= cost;}
            });

            cardkey = cardkey[0];
            await user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
            console.log(cardkey);
        }
    },{
        number:22,
        chname:'暗符「境界线」',
        janame:'闇符「ディマーケイション」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'2',
        cheffect:'行动次数 +1　弃置任意数量的手牌，并抓同样数目的牌。',
        jaeffect:' +1 アクション　手札のカードを好きな枚数捨て札にして、同じ枚数のカードを引く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1',
        use:async (user,f,that)=>{
            user.gainAction(1);
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要弃置的牌",
            	area: "hand",
            	min: 0,
            	max:  MAX_INT
            });
            user.drop(cardkey,'hand');
            console.log(cardkey);
            f.sendRep(user.socket,user,`${user.socket.username}弃置了${cardkey.length}张牌`);
            user.draw(cardkey.length);
        }
    },{
        number:23,
        chname:'梦符「封魔阵」',
        janame:'夢符「封魔陣」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'4',
        cheffect:'将此牌移出游戏，获得1张费用为⑤以下的牌。',
        jaeffect:'このカードを廃棄する。コスト⑤以下のカード１枚獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机',
        use:async (user,f,that)=>{
            user.trash([user.actionArea.indexOf(that)],'actionArea');
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: `请选择要获得的费用最多为5的牌`,
            	area: "kingdom",
            	min: 1,
            	max: 1,
              myFilter: (card) => {return card.cost <= 5;}
            });
            cardkey = cardkey[0];
            await user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
            console.log(cardkey);
        }
    },{
        number:24,
        chname:'灵符「梦想封印」',
        janame:'霊符「夢想封印」',
        enname:'',
        expansion:'红魔乡',
        types:['行动', '攻击'],
        cost:'4',
        cheffect:'获得1张「奉纳米」，置于你的牌堆顶。其他所有玩家从手牌中展示1张胜利点牌，置于自己的牌堆顶。（如果手牌中没有胜利点牌，展示所有手牌。）',
        jaeffect:'「奉納米」１枚獲得し、自分の山札の上に置く。他のプレイヤーは全員、自分の手札から勝利点カード1枚を公開し、自分の山札の上に置く。（手札に勝利点カードがない場合、手札を公開する。）',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机',
        use:async (user,f,that)=>{
            await user.gainCard('deck','basic',1,'gain','top');
            for(let otherUserkey in f.rooms[user.room].users){
                let otherUser = f.rooms[user.room].users[otherUserkey];
                if(otherUser.socket.username === user.socket.username) continue;
                await otherUser.attacked(that);
                if(otherUser.affect){
                  let cardkey = await f.ask({
                  	socket: otherUser.socket,
                  	title: that.chname,
                  	content: `请选择要放回牌堆顶的一张胜利点`,
                  	area: "hand",
                  	min: 1,
                  	max: 1,
                    myFilter: (card) => {return card.types.includes('胜利点');}
                  });
                  otherUser.showCard(cardkey.length > 0 ? cardkey : 'all');
                  otherUser.drop(cardkey,'hand','deck','top');
                }
                otherUser.affect = true;
            }
        }
    },{
        number:25,
        chname:'宵暗的妖怪「露米娅」',
        janame:'宵闇の妖怪「ルーミア」',
        enname:'',
        expansion:'红魔乡',
        types:['行动'],
        cost:'2',
        cheffect:'从中选择2项：「手牌 +1」「行动次数 +1」「购买次数 +1」「金钱+1」（必须选择不同的两项。）',
        jaeffect:'次のうち２つを選ぶ：「+1 カードを引く」；「+1 アクション」；「+1 カードを購入」「+①」（異なるものを２つ選ばなければならない。）',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1',
        use:async (user,f,that)=>{
            let choices = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择以下不同的两项：",
            	area: "check",
            	min:  2,
            	max:  2,
              myFilter: ["「手牌 +1」", "「行动次数 +1」", "「购买次数 +1」", "「金钱+1」"]
            });
            if(choices[0]) {user.draw(1);f.sendRep(user.socket,user,`手牌+1`);}
            if(choices[1]) {user.gainAction(1);f.sendRep(user.socket,user,`获得一点行动`);}
            if(choices[2]) {user.gainBuy(1);f.sendRep(user.socket,user,`购买+1`);}
            if(choices[3]) {user.gainMoney(1);f.sendRep(user.socket,user,`金钱+1`);}
        }
    }],
    [{
        number:1,
        chname:'神隐的主犯「八云紫」',
        janame:'神隠しの主犯「八雲紫」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'金钱+2\n所有其他角色将牌堆第一张置于弃牌区。若该牌是胜利点,对应玩家获得一张负分牌。否则,你可以选择将与该弃牌相同的牌给自己或给他。',
        jaeffect:' +②\n他のプレイヤーは全員、自分の山札の一番上のカードを捨て札にする。そのカードが勝利点カードの場合、そのプレイヤーはマイナスカード1枚を獲得する。勝利点以外のカードの場合、捨て札にしたカードと同じカードをそのプレイヤーが獲得するか、あなたが獲得するかをあなたが選ぶ。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ph'
    },{
        number:2,
        chname:'完美潇洒的从者「十六夜咲夜」',
        janame:'完全で瀟洒な従者「十六夜咲夜」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '持续'],
        cost:'5',
        cheffect:'你在本轮cleanup时，只摸3张（而非5张）。\n本轮之后获得追加的一轮。由本效果最多追加一轮。',
        jaeffect:'あなたは、このターンのクリーンアップフェイズに、かーどを（5枚ではなく）3枚しか引くことができない。\nこのターンの後に、追加の1ターンを得る。この効果で、あなたは追加ターンを、1ターンまでしか得ることができない。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机'
    },{
        number:3,
        chname:'冰之妖怪「琪露诺」',
        janame:'氷の妖怪「チルノ」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'3',
        cheffect:'行动次数+1 \n展示你的手牌。\n如果任意两张不重复，\n手牌+3。\n否则手牌+1。',
        jaeffect:'　+1　アクション\nあなたの手札を公開する。\n重複しているカードが1枚もない場合、\n+３　カードを引く。\nそれ以外の場合、+１　カードを引く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1',
        use:async (user,f,that)=>{
            user.gainAction(1);
            user.showCard('all');
            let filter = {basic:[],supply:[]};
            let identical = true;
            for(let i = user.hand.length - 1; i >= 0; i -= 1){
              let card = user.hand[i];
              if(filter[card.src][card.index]){
                identical = false;
                break;
              }
              filter[card.src][card.index] = true;
            }
            if(identical) user.draw(3);
            else user.draw(1);
        }
    },{
        number:4,
        chname:'寒符「lingering cold」',
        janame:'寒符「リンガリングコールド」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '持续'],
        cost:'4',
        cheffect:'手牌+1 \n行动次数+1 \n你的下回合开始时\n手牌+1。',
        jaeffect:'　+１　カードを引く。\n+1　アクション\nあなたの次のターンの開始時に、\n+１　カードを引く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1'
    },{
        number:5,
        chname:'狱界剑「二百由旬的一闪」',
        janame:'獄界剣「二百由甸の一閃」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '攻击'],
        cost:'4',
        cheffect:'金钱+2\n其他玩家所有人弃置一张「お賽銭」到弃牌区。(没有的玩家要展示手牌)',
        jaeffect:' +②\n他のプレイヤーは全員、「お賽銭」1枚を捨て札にする\n(手札に「お賽銭」がないプレイヤーは、手札を公開する)。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'5',
        use:async (user,f,that)=>{
            user.gainMoney(2);
            for(let otherUserkey in f.rooms[user.room].users){
                let otherUser = f.rooms[user.room].users[otherUserkey];
                if(otherUser.socket.username === user.socket.username) continue;
                await otherUser.attacked(that);
                if(otherUser.affect){
                  let cardkey = await f.ask({
                  	socket: otherUser.socket,
                  	title: that.chname,
                  	content: `请选择要弃置的一张「お賽銭」`,
                  	area: "hand",
                  	min: 1,
                  	max: 1,
                    myFilter: (card) => {return card.janame === '「お賽銭」';}
                  });
                  otherUser.drop(cardkey,'hand');
                  if(cardkey.length === 0){
                    otherUser.showCard('all');
                  }
                }
                otherUser.affect = true;
            }
        }
    },{
        number:6,
        chname:'樱符「完全墨染的樱花」',
        janame:'桜符「完全なる墨染の桜」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '攻击'],
        cost:'4',
        cheffect:'其他所有玩家将自己的牌堆第一张弃置，然后获得一张负分牌，放到牌堆第一张。',
        jaeffect:'他のプレイヤー全員は、自分の山札の一番上のカードを捨て札にし、その後、マイナスカード1枚を獲得し、自分の山札の一番上に置く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6',
        use:async (user,f,that)=>{
            for(let otherUserkey in f.rooms[user.room].users){
                let otherUser = f.rooms[user.room].users[otherUserkey];
                if(otherUser.socket.username === user.socket.username) continue;
                await otherUser.attacked(that);
                if(otherUser.affect){
                  otherUser.drop([0],'deck');
                  f.sendRep(otherUser.socket,otherUser,`${otherUser.socket.username}从牌堆顶弃置了${otherUser.deck[0].chname}`);
                  await otherUser.gainCard('deck','basic',6,'gain','top');
                }
                otherUser.affect = true;
            }
        }
    },{
        number:7,
        chname:'式符「飞翔晴明」',
        janame:'式符「飛翔晴明」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '持续'],
        cost:'2',
        cheffect:'手牌+1 行动次数+1 将你的一张手牌背面向上放到一旁。你的下一回合开始时，将这张牌加入你的手牌。',
        jaeffect:'　+１　カードを引く。\n+1　アクション\nあなたの手札のカード1枚を、裏向きにして脇に置く。\nあなたの次のターンの開始時に、そのカードをあなたの手札へ加える。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'2'
    },{
        number:8,
        chname:'式辉「princess天狐 -Illusion-」',
        janame:'式輝「プリンセス天狐 -Illusion-」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '响应'],
        cost:'3',
        cheffect:'将你的手牌补至6。',
        jaeffect:'あなたの手札が6枚になるまでカードを引く。',
        eneffect:'',
        chspecial:'你获得1张卡牌时，可以展示它。若如此做，你可以选择将它移出场外，或者放到牌堆第一张。',
        jaspecial:'あなたがカード1枚を獲得するとき、このカードを手札から公開してもよい。そうした場合、そのカードを廃棄するか、あなたの山札の一番上に置く。',
        enspecial:'',
        remark:'',
        stage:'ex',
        use:async (user,f,that)=>{
          user.draw(6 - user.hand.length);
        },
        onGain:(user,f,that)=>{
            user.onGain[that.id] = {
                from: that,
                func: async (user,f,that,card,to)=>{
                  if(!(user.hand.includes(that))) return;
                  let choice = await f.ask({
                  	socket: user.socket,
                  	title: that.chname,
                  	content: `你可以选择以下一项，若选择则同时展示${that.chname}：`,
                  	area:  'check',
                  	min:  0,
                  	max:  1,
                    myFilter: [`将${card.chname}废弃`, `将${card.chname}放到牌堆顶`]
                  });
                  if(choice[0]){user.showCard([user.hand.indexOf(that)]);user.trash([user[to].indexOf(card)],to);}
                  if(choice[1]){user.showCard([user.hand.indexOf(that)]);f.sendRep(user.socket,user,`${card.chname}放到了牌堆顶`);}
                }
            };
        },
    },{
        number:9,
        chname:'隙间妖怪的式神的式神「橙」',
        janame:'すきま妖怪の式の式「橙」',
        enname:'',
        expansion:'妖妖梦',
        types:['胜利点'],
        cost:'5',
        cheffect:'每有1张3胜利点，你计算本卡胜利点就+1。',
        jaeffect:'あなたが所有する「マヨヒガ　～寂びれた神棚～」1枚につき、勝利点１になる。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex',
        use:false,
        onGain:(user,f,that)=>{
          let eff = (factor) => {
            return {
                from:that,
                func:(user,f,from,card)=>{
                    if(card.expansion === "基础牌" && card.number === 5){
                        that.vp += 1 * factor;
                        user.vp += 1 * factor;
                    }
                }
            };
          };
          user.onGain[that.id] = eff(1);
          user.onLost[that.id] = eff(-1);
        },
    },{
        number:10,
        chname:'诅咒「魔彩光的上海人偶」',
        janame:'咒詛「魔彩光の上海人形」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'手牌+2 所有其他拥有4张以上手牌的玩家，将手牌放到牌堆顶，直到手牌变为3张。',
        jaeffect:'　+2　カードを引く\n手札を4枚以上持っている他のプレイヤーは全員、手札枚数が3枚になるまで、手札のカードを自分の山札の上に置く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3',
        use:async (user,f,that)=>{
              user.draw(2);
              for(let otherUserkey in f.rooms[user.room].users){
                  let otherUser = f.rooms[user.room].users[otherUserkey];
                  if(otherUser.socket.username === user.socket.username
                  || otherUser.hand.length < 4) continue;
                  await otherUser.attacked(that);
                  if(otherUser.affect){
                    let cardkey = await f.ask({
                    	socket: otherUser.socket,
                    	title: that.chname,
                    	content: `请选择要放回牌堆顶的${otherUser.hand.length - 3}张牌`,
                    	area: "hand",
                    	min: otherUser.hand.length - 3,
                    	max: otherUser.hand.length - 3
                    });
                    otherUser.drop(cardkey,'hand','deck','top');
                    f.sendRep(user.socket,user,`${otherUser.socket.username}放回了手牌`);
                  }

                  otherUser.affect = true;
              }
        }
    },{
        number:11,
        chname:'骚灵提琴手「露娜萨·普莉兹姆利巴」',
        janame:'騒霊ヴァイオリニスト「ルナサ・プリズムリバー」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'4',
        cheffect:'手牌+1 金钱+1 本回合所有的卡片（含玩家的手牌）的费用-1，不过不能低于0。',
        jaeffect:'　+1　カードを購入\n　+①\nこのターン、すべてのカード(プレイヤーの手札も含む)のコストは①少なくなる。しかし０未満にはならない。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4'
    },{
        number:12,
        chname:'隙间妖怪的式神「八云蓝」',
        janame:'すきま妖怪の式「八雲藍」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '持续'],
        cost:'5',
        cheffect:'将你的全部手牌置于弃牌堆。如果弃置1张以上的牌，下回合开始时手牌+5，购买次数+1，行动次数+1。',
        jaeffect:'あなたの手札すべてを捨て札にする。\nこの方法で１枚以上のカードを捨て札にした場合、次のターンの開始時に、\n+5　カードを引く、\n+1　カードを購入、\n+１　アクション。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex'
    },{
        number:13,
        chname:'骚灵键盘手「莉莉卡·普莉兹姆利巴」',
        janame:'騒霊キーボーディスト「リリカ・プリズムリバー」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'2',
        cheffect:'手牌+3 选择你手牌的1张，放到牌堆顶。',
        jaeffect:'　+3　カードを引く\nあなたの手札からカード1枚を選び、あなたの山札の一番上に置く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4',
        use:async (user,f,that)=>{
            user.draw(3);
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要放回牌堆顶的牌",
            	area: "hand",
            	min: 1,
            	max:  1
            });
            user.drop(cardkey,'hand','deck','top');
            console.log(cardkey);
        }
    },{
        number:14,
        chname:'骚灵小号手「梅露兰·普莉兹姆利巴」',
        janame:'騒霊トランペッター「メルラン・プリズムリバー」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'3',
        cheffect:'手牌+3 行动次数+1 弃置3张手牌。',
        jaeffect:'　+3　カードを引く\n+1　アクション\n　カード3枚を捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4',
        use:async (user,f,that)=>{
            user.draw(3);
            user.gainAction(1);
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要弃置的牌",
            	area:  "hand",
            	min: 3,
            	max:  3
            });
            user.drop(cardkey,'hand');
            console.log(cardkey);
        }
    },{
        number:15,
        chname:'大合葬「灵车大协奏曲」',
        janame:'大合葬「霊車コンチェルトグロッソ」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'5',
        cheffect:'手牌+1 行动次数+2 金钱+1',
        jaeffect:'　+1　カードを引く\n+2　アクション\n　+①',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4',
        use:(user,f)=>{
            user.draw(1);
            user.gainAction(2);
            user.gainMoney(1);
        }
    },{
        number:16,
        chname:'七色的人偶师「爱丽丝·玛格特洛依德」',
        janame:'七色の人形使い「アリス・マーガトロイド」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'3',
        cheffect:'你获得一张你右侧的玩家刚刚那轮获得的、费用6以下的一张卡。',
        jaeffect:'あなたの右隣のプレイヤーが、前のターンに獲得したコストが⑥以下のカードと同一のカード1枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3',
        use: async (user,f,that) =>{
          let userOrder = f.rooms[user.room].userOrder;
          let lastUser = (userOrder.indexOf(user.socket.username) + userOrder.length - 1) % userOrder.length;
          lastUser = f.rooms[user.room].users[userOrder[lastUser]];
          let cardkey = await f.ask({
          	socket: user.socket,
          	title: that.chname,
          	content: "请选择你要获得的牌",
          	area: "kingdom",
          	min: 1,
          	max: 1,
            myFilter: (card) =>{  return card.cost <= 6
              && typeof(lastUser.gained[card.src][card.index]) === "string";}
          });
          cardkey = cardkey[0];
          if(cardkey && lastUser.gained[cardkey.src][cardkey.index])
            await user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
        },
    },{
        number:17,
        chname:'赏花便在神社',
        janame:'花見は神社で',
        enname:'',
        expansion:'妖妖梦',
        types:['资源', '胜利点'],
        cost:'6',
        cheffect:'金钱+2 胜利点+2',
        jaeffect:' +②\n　勝利点２',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ed',
        use:(user)=>{
            user.gainMoney(2);
        },
        vp:2
    },{
        number:18,
        chname:'运送春天的妖精「莉莉霍瓦特」',
        janame:'春を運ぶ妖精「リリーホワイト」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'4',
        cheffect:'手牌+1 行动次数+2 你可以立刻将此牌移出场外。若如此做，金钱+2',
        jaeffect:'　+1　カードを引く\n+2　アクション\nあなたは、このカードを即座に廃棄してもよい。\nそうした場合、+②',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4',
        use:async (user,f,that)=>{
            user.draw(1);
            user.gainAction(2);
            if(await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "是否移出此牌？",
            	area: 'yn'
            })){
              user.trash([user.actionArea.indexOf(that)],'actionArea');
              user.gainMoney(2);
            }
        }
    },{
        number:19,
        chname:'普通的黑魔术少女「雾雨魔理沙」',
        janame:'普通の黒魔術少女「霧雨魔理沙」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'5',
        cheffect:'你左侧的玩家，展示牌堆顶的2张牌并弃置。你根据这两张牌的种类，获得：每有一张行动卡，行动次数+2；每有一张资源卡，金钱+2；每有一张胜利点卡，手牌+2。(若这两张牌同名，则只获得一次奖励）',
        jaeffect:'あなたの左隣のプレイヤーは、自分の山札の上から２枚のカードを公開し、捨て札にする。あなたは、その２枚のカードのうち、異なる名前のカードごとに…\nアクションカードの場合、+2　アクション\nリソースカードの場合、+②\n勝利点カードの場合、+2　カードを引く\n(カード名が同一の場合、そのカードの種類のボーナス１つのみを得る。)',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机'/*,
        use: async (user,f,that) =>{
          let userOrder = f.rooms[user.room].userOrder;
          let nextUser = (userOrder.indexOf(user.socket.username) + 1) % userOrder.length;
          nextUser = f.rooms[user.room].users[userOrder[nextUser]];

        },*/
    },{
        number:20,
        chname:'半分虚幻的庭师「魂魄妖梦」',
        janame:'半分幻の庭師「魂魄妖夢」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'3',
        cheffect:'行动次数+1 你观看牌堆顶三张牌，将1张移出场外，一张置于弃牌堆，剩余一张放在牌堆顶。',
        jaeffect:'　+1　アクション\nあなたの山札の上から３枚のカードを見て、その中の１枚を廃棄し、その中の１枚を捨て札にする。残り１枚を、あなたの山札の一番上に置く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'5'
    },{
        number:21,
        chname:'罔两「八云紫的神隐」',
        janame:'罔両「八雲紫の神隠し」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'2',
        cheffect:'从你的手牌中将至多4张牌移出场外。',
        jaeffect:'あなたの手札から最大４枚までのカードを廃棄する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ph',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要废弃的牌",
            	area: "hand",
            	min: 0,
            	max: 4
            });
            user.trash(cardkey,'hand');
        }
    },{
        number:22,
        chname:'冬天的遗忘之物「蕾蒂·霍瓦特洛克」',
        janame:'冬の忘れ物「レティ・ホワイトロック」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'2',
        cheffect:'手牌+1 行动次数+1 你可以弃置一张牌，并使行动次数+1；你可以弃置一张牌并使购入次数+1。',
        jaeffect:'　+１　カードを引く。\n+1　アクション\nあなたはカード１枚を捨て札にしてもよい。\nそうした場合、+1　アクション。\nあなたはカード１枚を捨て札にしてもよい。\nそうした場合、+1　カードを購入。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1',
        use: async (user,f,that)=>{
            user.draw(1);
            user.gainAction(1);
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "弃置1张牌，+1行动；或不弃置牌并跳过此选项",
            	area: "hand",
            	min: 0,
            	max:  1
            });
            if(cardkey[0] !== undefined){
              user.drop(cardkey, "hand");
              user.gainAction(1);
              f.sendRep(user.socket,user,`获得一点行动`);
            }
            cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "弃置1张牌，+1购买；或不弃置牌并跳过此选项",
            	area: "hand",
            	min: 0,
            	max:  1
            });
            if(cardkey[0] !== undefined){
              user.drop(cardkey, "hand");
              user.gainBuy(1);
              f.sendRep(user.socket,user,`获得一点购买`);
            }
            console.log(cardkey);
        }
    },{
        number:23,
        chname:'幽明结界',
        janame:'幽明結界',
        enname:'',
        expansion:'妖妖梦',
        types:['行动', '胜利点'],
        cost:'4',
        cheffect:'你可以将此牌与手牌中另一张置于一旁。游戏结束时，将由此效果置于一旁的两张牌放回牌堆。',
        jaeffect:'このカードと、あなたの手札にあるもう１枚のカードを脇に置く。ゲーム終了時に、このカードの効果で脇に置いた２枚を、あなたの山札へ戻す。',
        eneffect:'',
        chspecial:'胜利点+2 ',
        jaspecial:'勝利点２',
        enspecial:'',
        remark:'',
        stage:'4'
    },{
        number:24,
        chname:'幽冥楼阁的亡灵少女「西行寺幽幽子」',
        janame:'幽冥楼閣の亡霊少女「西行寺幽々子」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'5',
        cheffect:'你可以从手牌中展示一张6胜利点，若如此做，获得一张「御神酒」并加入手牌。否则获得一张「奉納米」并加入手牌。',
        jaeffect:'あなたは、自分の手札から「白玉楼　～春めく仏間～」１枚を公開してもよい。そうした場合、「御神酒」１枚を獲得し、自分の手札に加える。公開しなかった場合、「奉納米」１枚を獲得し、自分の手札に加える。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title:  that.chname,
            	content:  "请选择要展示的6胜利点",
            	area:  "hand",
            	min:  0,
            	max:  1,
              myFilter: (card) => {return card.chname === '永远亭';}
            });
            if(cardkey[0] !== undefined){
              user.showCard(cardkey);
              await user.gainCard('hand','basic',2,'gain');
            }
            else{
              await user.gainCard('hand','basic',1,'gain');
            }
        }
    },{
        number:25,
        chname:'乐园的可爱巫女「博丽灵梦」',
        janame:'楽園の素敵な巫女「博麗霊夢」',
        enname:'',
        expansion:'妖妖梦',
        types:['行动'],
        cost:'5',
        cheffect:'你可以观看你的弃牌区所有牌，将任意「お賽銭」展示，并放到你的手牌中。',
        jaeffect:'あなたの捨て札のカードすべてを確認し、その中から好きな枚数の「お賽銭」を公開し、それをあなたの手札に加える。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机'
    }],
    [{
        number:1,
        chname:'五个难题',
        janame:'五つの難題',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'4',
        cheffect:'行动次数 +1 所有玩家都可以从自己的手牌中展示1张「永遠亭～月下の祭礼～」。若你这么做，弃置该牌，获得1张奖励牌（从奖励牌牌堆抽取）或1张「迷いの竹林～路傍の石仏～」，置于你的牌堆顶。若其他玩家中没有人展示，你获得手牌 +1，金钱 +1。',
        jaeffect:'+1 アクション すべてのプレイヤーは、自分の手札から「永遠亭～月下の祭礼～」1枚を公開してもよい。あなたがそうした場合、そのカードを捨て札にし、褒賞カード1枚（褒賞の山札から）または「迷いの竹林～路傍の石仏～」１枚を獲得し、それをあなたのデッキの一番上に置く。他のプレイヤーが誰も公開しなたっか場合、+1 カードを引く、+ ①。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6b'
    },{
        number:2,
        chname:'永远与须臾的罪人「蓬莱山辉夜」',
        janame:'永遠と須臾の罪人「蓬莱山輝夜」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +1 行动次数 +1 金钱 +1',
        jaeffect:'+1 カードを引く +1 アクション + ①',
        eneffect:'',
        chspecial:'当你将这张牌从行动区置入弃牌堆时，若你本回合没有购买过胜利点牌，你可以将此牌置于牌堆顶。',
        jaspecial:'あなたがこのカードをプレイエリアから捨て札にするとき、あなたがこのターン勝利点カードを購入していない場合、このカードをデッキの一番上においてもよい。',
        enspecial:'',
        remark:'',
        stage:'6b'//.myFilter((card)=>{return card.types.includes('buy') && card.src === 'basic' && xx > card.index > xx})
    },{
        number:3,
        chname:'狂气的月兔「铃仙·优昙华院·因幡」',
        janame:'狂気の月の兎「鈴仙・優曇華院・イナバ」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'3',
        cheffect:'手牌 +1 行动次数 +1 指定1张牌。从你的牌堆顶展示1张牌。若展示出的是你指定的牌，将其加入你的手牌。',
        jaeffect:'+1 カードを引く +1 アクション カード１枚を指定する。あなたのデッキの一番上のカードを公開する。公開したカードが指定したカードの場合、それをあなたの手札に加える。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'5'
    },{
        number:4,
        chname:'永夜返',
        janame:'永夜返し',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '响应'],
        cost:'4',
        cheffect:'购买次数 +1 金钱 +3 弃置2张牌。',
        jaeffect:'+1 カードを引く + ③ カード2枚を捨て札にする。',
        eneffect:'',
        chspecial:'当其他玩家使用攻击牌时，你可以将这张牌从手牌放到一边。若你这么做，当你的下个回合开始时，你获得手牌 +1，并将这张牌放回你的手牌。',
        jaspecial:'他のプレイヤーがアタックカードを使ったとき、あなたはこのカードを手札から脇に置いてもよい。そうした場合、あなたの次のターンの開始時に+1 カードを引く。そしてこのカードをあなたの手札に戻す。',
        enspecial:'',
        remark:'',
        stage:'6b',/*
        use:async (user,f,that) => {
          user.gainBuy(1);
          user.gainMoney(3);
          let cardkey = await f.ask({
            socket: user.socket,
            title: that.chname,
            content: `请选择要弃置的2张牌`,
            area: "hand",
            min: 2,
            max: 2
          });
          otherUser.drop(cardkey,'hand');
        },
        onAttack: async*/
    },{
        number:5,
        chname:'禁咒的咏唱组',
        janame:'禁呪の詠唱チーム',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'5',
        cheffect:'从下列2项中选择1项:「从已移出游戏的牌中获得1张费用为③～⑥的牌，置于你的牌堆顶」；「将你手牌中的1张行动牌移出游戏，获得1张费用比该牌最多高③的牌」',
        jaeffect:'次のうち１つを選ぶ:「廃棄置き場にあるコスト③～⑥のカード１枚を獲得し、あなたのデッキの一番上に置く」；「あなたの手札のアクションカード１枚を廃棄し、廃棄したカードよりもコストが最大③まで多いカード１枚を獲得する」',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机'
    },{
        number:6,
        chname:'国符「三种神器」',
        janame:'国符「三種の神器」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'3',
        cheffect:'从下列3项中选择1项:「手牌 +2」；「金钱 +2」；「将你的2张手牌移出游戏」',
        jaeffect:'次のうち１つを選ぶ:「+2 カードを引く」；「+ ②」；「あなたの手札から二枚のカードを廃棄する」',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3',
        use:async (user,f,that)=>{
            let choices = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择一项：",
            	area: "check",
            	min: 1,
            	max: 1,
              myFilter: ["「手牌 +2」", "「金钱 +2」", "「将你的2张手牌移出游戏」"]
            });
            if(choices[0]) {user.draw(2);f.sendRep(user.socket,user,`手牌+2`);}
            if(choices[1]) {user.gainMoney(2);f.sendRep(user.socket,user,`金钱+2`);}
            if(choices[2]){
                  let cardkey = await f.ask({
                  	socket: user.socket,
                  	title: that.chname,
                  	content: "请选择要废弃的牌",
                  	area: "hand",
                  	min: 2,
                  	max:  2
                  });
                  user.trash(cardkey,'hand');
                  console.log(cardkey);
            }
        }
    },{
        number:7,
        chname:'幻想的结界组',
        janame:'幻想の結界チーム',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'6',
        cheffect:'将你的1张手牌移出游戏。获得一张费用最多为⑤的牌。',
        jaeffect:'あなたの手札１枚を廃棄する。コスト⑤以下のカード１枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title:  that.chname,
            	content:  "请选择要废弃的牌",
            	area:  "hand",
            	min:  1,
            	max:  1
            });
            user.trash(cardkey,'hand');
            cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: `请选择要获得的费用最多为5的牌`,
            	area: "kingdom",
            	min: 1,
            	max: 1,
              myFilter: (card) =>{return card.cost <= 5;}
            });
            cardkey = cardkey[0];
            await user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
            console.log(cardkey);
        }
    },{
        number:8,
        chname:'新史「新幻想史 -现代史-」',
        janame:'新史「新幻想史 -ネクストヒストリー-」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'5',
        cheffect:'将你手牌中的1张资源牌移出游戏。获得一张比该牌费用最多高③的资源牌，加入你的手牌。',
        jaeffect:'あなたの手札のリソースカード１枚を廃棄する。廃棄したリソースカードよりもこすとが最大③多いリソースカード１枚を獲得し、あなたの手札に加える。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title:  that.chname,
            	content:  "请选择要废弃的资源牌",
            	area:  "hand",
            	min:  1,
            	max:  1,
              myFilter: (card)=>{return card.types.includes('资源');}
            });
            if(!user.hand[cardkey[0]].types.includes('资源')){return;}
            let cost = Number(user.hand[cardkey[0]].cost) + 3;
            user.trash(cardkey,'hand');
            cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: `请选择要获得的费用最多为${cost}的资源牌`,
            	area: "kingdom",
            	min: 1,
            	max: 1,
              myFilter: (card)=>{return card.types.includes('资源') && card.cost <= cost;}
            });
            cardkey = cardkey[0];
            await user.gainCard('hand', cardkey.src, cardkey.index, 'gain');
            console.log(cardkey);
        }
    },{
        number:9,
        chname:'知识与历史的半兽「上白泽慧音」',
        janame:'知識と歴史の半獣「上白沢慧音」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'3',
        cheffect:'购买次数 +1 弃置任意数量的手牌，每弃置1张牌，你获得手牌 +1。弃置任意数量的手牌，每弃置1张牌，你获得金钱 +1。',
        jaeffect:'+1 カードを購入 手札から好きな枚数を捨て札にする。捨て札にしたカード1枚につき+1 カードを引く。 手札から好きな枚数を捨て札にする。捨て札にしたカード1枚につき+ ①。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3',
        use: async (user,f,that)=>{
            user.gainBuy(1);
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "弃置任意张手牌，每张+1手牌",
            	area: "hand",
            	min: 0,
            	max:  MAX_INT
            });
            if(cardkey[0] !== undefined){
              user.drop(cardkey, "hand");
              user.draw(cardkey.length);
              f.sendRep(user.socket,user,`重抽了${cardkey.length}张牌`);
            }
            cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "弃置任意张手牌，每张+1钱",
            	area: "hand",
            	min: 0,
            	max:  MAX_INT
            });
            if(cardkey[0] !== undefined){
              user.drop(cardkey, "hand");
              user.gainMoney(cardkey.length);
              f.sendRep(user.socket,user,`获得了${cardkey.length}金钱`);
            }
            console.log(cardkey);
        }
    },{
        number:10,
        chname:'地上兔「因幡帝」',
        janame:'地上の兎「因幡てゐ」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'2',
        cheffect:'金钱 +2 各名玩家（包括你）查看自己牌堆顶的1张牌，并选择将其弃置或放回原处。',
        jaeffect:'+ ② 各プレイヤー(あなたも含む)は自分のデッキの一番上のカードを見て、そのカードを捨て札にするかそのまま戻すかをする。',
        eneffect:'',
        chspecial:'在使用这张牌的游戏中，当一名玩家获得「迷いの竹林～路傍の石仏～」时，可以同时获得1张「地上の兎「因幡てゐ」」。',
        jaspecial:'このカードを使用しているゲームで「迷いの竹林～路傍の石仏～」を獲得したとき、「地上の兎「因幡てゐ」」１枚を獲得してもよい。',
        enspecial:'',
        remark:'',
        stage:'5'
    },{
        number:11,
        chname:'月之头脑「八意永琳」',
        janame:'月の頭脳「八意永琳」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'5',
        cheffect:'从下列3项中选择1项:「弃置2张牌」；「将你的1张手牌置于牌堆顶」；「获得1张「お賽銭」」 从下列3项中选择1项:「金钱 +3」；「将你的全部手牌移出游戏」；「获得1张「迷いの竹林 ～路傍の石仏～」」 ',
        jaeffect:'次のうち１つを選ぶ:「カード2枚を捨て札にする」；「あなたの手札のカード１枚をあなたのデッキの一番上に置く」；「「お賽銭」１枚を獲得する」 次のうち１つを選ぶ:「+③」；「あなたの手札を廃棄する」；「「迷いの竹林 ～路傍の石仏～」１枚を獲得する」',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6a',
        use:async (user,f,that)=>{
            let choices = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择以下一项：",
            	area: "check",
            	min:  1,
            	max:  1,
              myFilter: ["「弃置2张牌」", "「放回牌堆顶1张牌」", "「获得1张赛钱」"]
            });
            if(choices[0]) {
                let cardkey = await f.ask({
                socket: user.socket,
                title: that.chname,
                content: `请选择要弃置的2张牌`,
                area: "hand",
                min: 2,
                max: 2
              });
              user.drop(cardkey,'hand');
              f.sendRep(user.socket,user,`弃置2张`);
            }
            if(choices[1]) {
                let cardkey = await f.ask({
                socket: user.socket,
                title: that.chname,
                content: `请选择要放回牌堆顶的一张牌`,
                area: "hand",
                min: 1,
                max: 1
              });
              user.drop(cardkey,'hand','deck','top');
              f.sendRep(user.socket,user,`放回一张`);
            }
            if(choices[2]) {await user.gainCard('drops','basic',0,'gain');f.sendRep(user.socket,user,`获得1张赛钱`);}
            choices = await f.ask({
                	socket: user.socket,
                	title: that.chname,
                	content: "请选择以下一项：",
                	area: "check",
                	min:  1,
                	max:  1,
                  myFilter: ["「金钱 +3」", "「废弃全部手牌」", "「获得1张3分」"]
            });
            if(choices[0]) {user.gainMoney(3);f.sendRep(user.socket,user,`金钱 +3`);}
            if(choices[1]) {user.trash('all','hand');f.sendRep(user.socket,user,`废弃了全部手牌`);}
            if(choices[2]) {await user.gainCard('drops','basic',4,'gain');f.sendRep(user.socket,user,`获得1张3分`);}
        }
    },{
        number:12,
        chname:'天咒「Apollo 13」',
        janame:'天呪「アポロ13」',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'手牌 +3 其他玩家各自从下列2项中选择1项：「弃置2张牌」；「获得1张负分牌（マイナスカード），加入自己的手牌」',
        jaeffect:'+3 カードを引く 他のプレイヤーはそれぞれ、次のうち１つを選ぶ:「カード2枚を捨て札にする」；「マイナスカード１枚を獲得し、自分の手札に加える」',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6a',
        use:async (user,f,that)=>{
              user.draw(3);
              let otherUsers = Object.keys(f.rooms[user.room].users)
                .map(key => f.rooms[user.room].users[key])
                .filter(otherUser => !(otherUser.socket.username === user.socket.username));// for ordering
              let promises = otherUsers.map(otherUser => (async (otherUser) => {
                await otherUser.attacked(that);
                if(otherUser.affect){
                  let choices = await f.ask({
                    socket: otherUser.socket,
                    title: that.chname,
                    content: "请选择以下一项：",
                    area: "check",
                    min:  1,
                    max:  1,
                    myFilter: ["「弃置2张牌」", "「入手一张负分牌」"]
                  });
                  if(choices[0]) {
                      let cardkey = await f.ask({
                          socket: otherUser.socket,
                          title: that.chname,
                          content: `请选择要弃置的2张牌`,
                          area: "hand",
                          min: 2,
                          max: 2
                        });
                      otherUser.drop(cardkey,'hand');
                    f.sendRep(user.socket,user,`${otherUser.socket.username}弃置了2张牌`);
                  }
                if(choices[1]){await otherUser.gainCard('hand','basic',6,'gain');f.sendRep(user.socket,user,`${otherUser.socket.username}入手1张负分`);}
                otherUser.affect = true;

                }
              })(otherUser));
              await Promise.all(promises);

      },
    },{
        number:13,
        chname:'人类村落',
        janame:'人間の里',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '持续'],
        cost:'5',
        cheffect:'现在 及 下回合开始时：手牌 +2 购买次数 +1',
        jaeffect:'現在と、次のターンの開始時に: +2 カードを引く +1 カードを購入',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3'
    },{
        number:14,
        chname:'「Possessed by Phoenix」',
        janame:'「パゼストバイフェニックス」',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'金钱 +2 若已移出游戏的牌中有费用为③～⑥的牌，从中获得1张。若没有，所有其他玩家从自己的牌堆顶展示2张牌，将其中1张费用为③～⑥的牌移出游戏，其余弃置。',
        jaeffect:'+ ② 廃棄置場にコストが③～⑥のかーどがある場合、その中の１枚を獲得する。ない場合、他のプレーヤーは全員自分のデッキの上から２枚のカードを公開し、その中のコストが③～⑥のカードを１枚を廃棄し、残りを捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex'
    },{
        number:15,
        chname:'蓬莱之药',
        janame:'蓬莱の薬',
        enname:'',
        expansion:'永夜抄',
        types:['资源'],
        cost:'5',
        cheffect:'① 当你使用这张牌时，你可以获得1张「お賽銭」并加入手牌。',
        jaeffect:'① このカードを使用するとき、あなたは「お賽銭」１枚を獲得して手札に加えてもよい。',
        eneffect:'',
        chspecial:'当你获得这张牌时，所有其他玩家获得1张负分牌（マイナスカード）。',
        jaspecial:'このカードを獲得するとき、他のプレイヤーは全員、マイナスカード１枚を獲得する。',
        enspecial:'',
        remark:'',
        stage:'6a',
        use:async (user,f,that)=>{
            user.gainMoney(1);
            if(await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "是否将一张「お賽銭」加入手牌？",
            	area: 'yn'
            })){
              await user.gainCard('hand','basic', 0, 'gain');
            }
        },
        onGain:async (user,f,that) =>{
          let otherUsers = Object.keys(f.rooms[user.room].users)
            .map(key => f.rooms[user.room].users[key])
            .filter(otherUser => !(otherUser.socket.username === user.socket.username));// for ordering
          let promises = otherUsers.map(user => user.gainCard('drops','basic',6,'gain'));
          await Promise.all(promises);
        }
    },{
        number:16,
        chname:'蓬莱人的外形「藤原妹红」',
        janame:'蓬莱の人の形「藤原妹紅」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'4',
        cheffect:'手牌 +1 行动次数 +2',
        jaeffect:'+1 カードを引く +2 アクション',
        eneffect:'',
        chspecial:'当你将这张牌移出游戏时，将这张牌加入手牌。',
        jaspecial:'あなたはこのカードを廃棄したとき、このカードを手札に加える。',
        enspecial:'',
        remark:'',
        stage:'ex',
        use:(user,f,that)=>{
            user.draw(1);
            user.gainAction(2);
        },
        onTrash:(user,f) =>{return false;},
    },{
        number:17,
        chname:'诱人的新下酒菜「烤八目鳗」',
        janame:'魅惑の新酒肴「焼き八目鰻」',
        enname:'',
        expansion:'永夜抄',
        types:['资源'],
        cost:'4',
        cheffect:'① ',
        jaeffect:'① ',
        eneffect:'',
        chspecial:'当这张牌出现在行动区时，行动牌的费用减②（但不会低于⓪）。',
        jaspecial:'このカードがプレイエリア出でているかぎり、アクションカードのコストは②少なくなる。ただし、⓪未満にはならない。',
        enspecial:'',
        remark:'',
        stage:'2'
    },{
        number:18,
        chname:'梦幻的红魔组',
        janame:'夢幻の紅魔チーム',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'4',
        cheffect:'获得1张「奉納米」。 查看你牌堆顶的1张牌，将其弃置或放回原处。 抽牌，将你的手牌补到5张。 你可以将你手牌中的1张非资源牌移出游戏。',
        jaeffect:'「奉納米」1枚を獲得する。あなたのデッキの一番上を見て、そのカードを捨て札にするか、そのまま戻すかをする。あなたの手札が5枚になるまでカードを引く。あなたは手札からリソースカード以外のカード1枚を廃棄してもよい。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'自机'
    },{
        number:19,
        chname:'散符「真实之月(Invisible Full Moon)」',
        janame:'散符「真実の月(インビジブルフルムーン)」',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '攻击'],
        cost:'3',
        cheffect:'展示1张你的手牌，将至多2张与该牌相同的手牌放回补给区。这之后，所有其他玩家依次获得1张与该牌相同的牌。',
        jaeffect:'あなたの手札1枚を公開する。公開したカードと同じカード最大2枚までを、あなたの手札からサプライに戻す。その後、他のプレイヤー全員は、それと同じカードを1枚ずつ獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'5',
    /*    use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要展示的牌",
            	area: "hand",
            	min: 1,
            	max: 1
            });
            user.showCard(cardkey);

        }*/
    },{
        number:20,
        chname:'暗中蠢动的光虫「莉格露·奈特巴格」',
        janame:'闇に蠢く光の蟲「リグル・ナイトバグ」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'2',
        cheffect:'手牌 +1 行动次数 +1 查看你牌堆底的1张牌。你可以将其置于牌堆顶。',
        jaeffect:'+1 カードを引く +1 アクション あなたのデッキの一番下のカードを見る。あなたは、そのカードをデッキの一番上に置いてもよい。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1'
    },{
        number:21,
        chname:'蠢符「Little Bug Storm」',
        janame:'蠢符「リトルバクストーム」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'4',
        cheffect:'金钱 +2 你可以弃置你牌堆里的所有牌。查看你的弃牌堆中的所有牌，将其中1张牌置于你的牌堆顶。',
        jaeffect:'+ ② あなたのデッキをあなたの捨て札に置いてもよい。あなたの捨て札のカードすべてを見て、その中の1枚をあなたのデッキの一番上に置く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1'
    },{
        number:22,
        chname:'夜雀「午夜中的合唱指挥」',
        janame:'夜雀「真夜中のコーラスマスター」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'4',
        cheffect:'手牌 +1 行动次数 +2 从你的牌堆顶展示3张牌。将其中的行动牌以任意顺序放回牌堆顶，其余弃置。',
        jaeffect:'+1 カードを引く +2 アクション あなたのデッキの上から3枚のカードを公開する。その中のアクションカードを好きな順番でデッキの上に戻し、公開した残りのカードを捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'2'
    },{
        number:23,
        chname:'幽冥的住人组',
        janame:'幽冥の住人チーム',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '响应'],
        cost:'4',
        cheffect:'将你的1张手牌移出游戏。获得与该牌费用数相同张数的「奉納米」。',
        jaeffect:'自分の手札のカード1枚を廃棄する。そのカードのコスト数と同じ枚数の「奉納米」を獲得する。',
        eneffect:'',
        chspecial:'当你获得1张牌时，你可以从手牌中展示本牌。若你这么做，获得的牌改为1张「奉納米」。',
        jaspecial:'あなたがカード1枚を獲得したとき、あなたはこのカードを手札から公開してもよい。そうした場合、獲得するカードの代わりに「奉納米」1枚を獲得する。',
        enspecial:'',
        remark:'',
        stage:'自机',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要废弃的牌",
            	area: "hand",
            	min: 1,
            	max: 1
            });
            for(let i = user.hand[cardkey[0]].cost; i > 0; i -= 1){
                await user.gainCard('drops','basic',1,'gain');
            }
            user.trash(cardkey,'hand');
        },
        onGain:async (user,f,that)=>{
            user.beforeGain[that.id] = {
                from: that,
                func: async (user,f,that,card,to)=>{
                  if(!(user.hand.includes(that))
                || card.chname === '奉纳米') return;
                  if(await f.ask({
                    socket: user.socket,
                    title: that.chname,
                    content: `是否展示${that.chname}并改为获得奉纳米？`,
                    area:  'yn'
                  })){user.showCard([user.hand.indexOf(that)]);await user.gainCard('drops','basic',1,'gain');return false;}
                }
            };
        },
    },{
        number:24,
        chname:'吞食历史「上白泽慧音」',
        janame:'歴史喰い「上白沢慧音」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'5',
        cheffect:'行动次数 +1 指定1张牌。从你的牌堆顶逐张翻牌，直到翻开1张除指定牌以外的胜利点牌。弃置其余翻开的牌，将该胜利点牌移出游戏，获得1张比该牌费用最多高③的胜利点牌。',
        jaeffect:'+1 アクション カード1枚を指定する。あなたのデッキから指定したカード以外の勝利点カード1枚が公開されるまで、カードを公開する。公開した他のカードは捨て札にする。その勝利点カードを廃棄し、そのカードよりもコストが最大③多い勝利点カード1枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex'
    },{
        number:25,
        chname:'夜雀妖怪「米斯蒂娅·萝蕾拉」',
        janame:'夜雀の怪「ミスティア・ローレライ」',
        enname:'',
        expansion:'永夜抄',
        types:['行动'],
        cost:'3',
        cheffect:'行动次数 +2 展示你的手牌。若你的手牌中没有行动牌，你获得手牌 +2。',
        jaeffect:'+2 アクション あなたの手札を公開する。あなたの手札にアクションカードが1枚もない場合、+2 カードを引く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'2',
        use:async (user,f,that)=>{
            user.gainAction(2);
            user.showCard('all');
            let acCard = false;
            if(user.hand.filter((card) => {return card.types.includes('行动');}).length === 0){
              user.draw(2);
            }
        }
    },{
        number:26,
        chname:'龙颈之玉　-五色的弹丸-',
        janame:'龍の頸の玉　-五色の弾丸-',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '奖励'],
        cost:'0*',
        cheffect:'从下列4项中选择2项:「手牌 +2」；「行动次数 +2」；「金钱 +2」；「获得4张「奉納米」，并弃置你牌堆里的所有牌」（必须选择不同的2项。）（这张牌不放在补给区里。 ）',
        jaeffect:'以下のうち2つを選ぶ:「+2 カードを引く」；「+2 アクション」；「+②」；「「奉納米」4枚を獲得し、あなたのデッキを捨て札に置く」(必ず異なるものを選択しなければならない。) (このカードはサプライに置かない。)',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6b'
    },{
        number:27,
        chname:'佛御石之钵　-不碎的意志-',
        janame:'仏の御石の鉢　-砕けぬ意志-',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '奖励'],
        cost:'0*',
        cheffect:'行动次数 +1 获得1张「御神酒」，并置于你的牌堆顶。（这张牌不放在补给区里。 ）',
        jaeffect:'+1 アクション 「御神酒」1枚を獲得し、あなたのデッキの一番上に置く。(このカードはサプライに置かない。)',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6b'
    },{
        number:28,
        chname:'火鼠的皮衣　-不焦躁的内心-',
        janame:'火鼠の皮衣　-焦れぬ心-',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '奖励'],
        cost:'0*',
        cheffect:'购买次数 +1',
        jaeffect:'+1 カードを購入',
        eneffect:'',
        chspecial:'当这张牌出现在行动区时，所有牌的费用减②（但不会低于⓪）。（这张牌不放在补给区里。 ）',
        jaspecial:'このカードがプレイエリアに出ているかぎり、カードのコストは②少なくなる。ただし、⓪未満にはならない。(このカードはサプライに置かない。)',
        enspecial:'',
        remark:'',
        stage:'6b'
    },{
        number:29,
        chname:'燕的子安贝　-永命线-',
        janame:'燕の子安貝　-永命線-',
        enname:'',
        expansion:'永夜抄',
        types:['资源', '奖励'],
        cost:'0*',
        cheffect:'② 当你使用这张牌时，你每有1未使用的行动次数，你获得金钱 +1。[不是行动牌的张数，而是剩余的行动次数。]（这张牌不放在补给区里。 ）',
        jaeffect:'② このカードを使うとき、あなたが使用しなかったアクション1回につき+①。(アクションカードの枚数ではなく、アクションの機会の回数のことを指す。)(このカードはサプライに置かない。)',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6b'
    },{
        number:30,
        chname:'蓬莱的弹枝　-七色的弹幕-',
        janame:'蓬莱の弾の枝　-虹色の弾幕-',
        enname:'',
        expansion:'永夜抄',
        types:['行动', '攻击', '奖励'],
        cost:'0*',
        cheffect:'手牌 +2 获得1张「博麗神社 ～間借りの一画～」。其他所有玩家每人获得1张负分牌（マイナスカード），并将自己的手牌弃至3张。（这张牌不放在补给区里。 ）',
        jaeffect:'+2 カードを引く 「博麗神社 ～間借りの一画～」1枚を獲得する。他のプレイヤーは全員、マイナスカード1枚を獲得し、自分の手札が3枚になるように捨て札をする。(このカードはサプライに置かない。)',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6b'
    }],
    [{
        number:1,
        chname:'河童「延展手臂」',
        janame:'河童「のびーるアーム」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'4',
        cheffect:'展示你牌堆顶的5张牌。请你左边的玩家从中选出一张，你弃置之。将剩下的四张牌加入你的手牌。',
        jaeffect:'あなたのデッキの上から５枚のかーどを公開する。\nあなたの左隣のプレイヤーはその中から１枚を選び、\nあなたはそのカードを捨て札にする。\n残りの４枚をあなたの手札に加える。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3'
    },{
        number:2,
        chname:'「幻想风靡」',
        janame:'「幻想風靡」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'7',
        cheffect:'你可以从你的手牌中选择一张行动牌。将其使用3次。',
        jaeffect:'あなたは自分の手札のアクションカード１枚を選んでもよい。\nそのカードを３回使用する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4'
    },{
        number:3,
        chname:'最接近村落的天狗「射命丸文」',
        janame:'里に最も近い天狗「射命丸文」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'4',
        cheffect:'行动次数 +2 从你的牌堆顶依次翻牌直至出现行动牌或资源牌，将该牌加入你的手牌，其余弃置。',
        jaeffect:'　+2　アクション\nあなたのデッキからアクションまたはリソースカード１枚が公開されるまで、カードを公開する。公開したアクションまたはリソースカードをあなたの手札に加え、他の公開したカードは捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4'
    },{
        number:4,
        chname:'下端哨戒天狗「犬走椛」',
        janame:'下っ端哨戒天狗「犬走椛」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'4',
        cheffect:'行动次数 +1 展示你牌堆顶的4张牌。将其中的胜利点牌加入你的手牌。并将其余的牌以任意顺序置于牌堆顶。',
        jaeffect:'　+1　アクション\nあなたのデッキの上から４枚のカードを公開する。勝利点カードを公開した場合、あなたの手札に加える。\n残りのカードは好きな順番であなたのデッキの上に置く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4'
    },{
        number:5,
        chname:'神祭「扩展御柱」',
        janame:'神祭「エクスパンデッド·オンバシラ」',
        enname:'',
        expansion:'风神录',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'手牌 +3 购买次数 +1 其他所有玩家每人摸一张牌，然后弃置手牌直至3张。',
        jaeffect:'　+3　カードを引く\n+1　カードを購入\n他のプレイヤーは全員カード1枚を引き、\nその後手札が3枚になるまで捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6',
        use:async (user,f,that)=>{
            user.draw(3);
            user.gainBuy(1);

            let otherUsers = Object.keys(f.rooms[user.room].users)
              .map(key => f.rooms[user.room].users[key])
              .filter(otherUser => !(otherUser.socket.username === user.socket.username));// for ordering
            let promises = otherUsers.map(user => (async (otherUser) => {
              await otherUser.attacked(that);
              if(otherUser.affect){
                await otherUser.draw(1);
                let cardkey = await f.ask({
                  socket: otherUser.socket,
                  title: that.chname,
                  content: `请选择要弃置的${otherUser.hand.length - 3}张牌`,
                  area: "hand",
                  min: otherUser.hand.length - 3,
                  max: otherUser.hand.length - 3
                });
                otherUser.drop(cardkey,'hand');
              }
              otherUser.affect = true;
            })(user));
            await Promise.all(promises);
        }
    },{
        number:6,
        chname:'祟符「洩矢大人」',
        janame:'祟符「ミシャグジさま」',
        enname:'',
        expansion:'风神录',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'金钱 +2 其他所有玩家每人可以弃置一张负分牌。如果不这么做，则获得一张负分牌及一张「お賽銭」。',
        jaeffect:' +②\n他のプレイヤーは全員、マイナスカード1枚を捨て札にしてもよい。そうしない場合、マイナスカード1枚と「お賽銭」1枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex',
        use:async (user,f,that)=>{
            user.gainMoney(2);

            let otherUsers = Object.keys(f.rooms[user.room].users)
              .map(key => f.rooms[user.room].users[key])
              .filter(otherUser => !(otherUser.socket.username === user.socket.username));// for ordering
            let promises = otherUsers.map(user => user.attacked(that));
            await Promise.all(promises);

            promises = otherUsers.filter(user => user.affect)
              .map(user => f.ask({
                socket: user.socket,
                title:  that.chname,
                content:  "请选择要弃置的负分",
                area:  "hand",
                min:  0,
                max:  1,
                myFilter: (card) => {return card.types.includes('负分');}
              }));
            let results = await Promise.all(promises);
            promises = [];
            for (let otherUser of otherUsers){
              let cardkey = results.shift();
              if(cardkey.length < 1){
                promises.push(otherUser.gainCard('drops','basic',0,'gain'));
                promises.push(otherUser.gainCard('drops','basic',6,'gain'));
              }
              else {otherUser.drop(cardkey,'hand');}
            }
            await Promise.all(promises);
            otherUsers.forEach(user => {user.affect = true;});

        }
    },{
        number:7,
        chname:'创符「pain flow」',
        janame:'創符「ペインフロー」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'4',
        cheffect:'金钱 +2 观看你牌堆顶上的5张牌，然后你可以将其全部弃置或将他们以任意顺序置于你的牌堆顶。',
        jaeffect:' +②\nあなたのデッキの上から5枚のカードを見る。見たらカードすべてを捨て札にする、または、見たカードすべてを好きな順番にあなたのデッキの上へ戻す。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'2'
    },{
        number:8,
        chname:'超妖怪弹头「河城荷取」',
        janame:'超妖怪弾頭「荷城にとり」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +1 行动次数 +2 若有一张及以上的补给牌已用尽，手牌 +1。若有两张及以上的补给牌已用尽，金钱 +1，购买次数 +1',
        jaeffect:' +１　カードを引く\n+2　アクション\nカードが1枚も残っていないサプライが１つ以上ある場合、+１カードを引く\n２つ以上ある場合さらに+①と+1カードを購入。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3'
    },{
        number:9,
        chname:'土著神的顶点「洩矢诹访子」',
        janame:'土着神の頂点「洩矢諏訪子」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'5',
        cheffect:'你可以展示你手牌中的一张资源牌，并获得一张与你公开的牌相同的资源牌。',
        jaeffect:'あなたは手札からリソースカード1枚を公開してもよい。公開したものと同じリソースカード1枚を獲得する。',
        eneffect:'',
        chspecial:'当你购买这张牌时，将你行动区的所有资源牌移出游戏。',
        jaspecial:'このカードを購入するとき、あなたがプレイエリアに出しているすべてのリソースカードを廃棄する。',
        enspecial:'',
        remark:'',
        stage:'ex'
    },{
        number:10,
        chname:'秘术「Gray Thaumaturgy」',
        janame:'秘術「グレイソーマタージ」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'7',
        cheffect:'将你的一张手牌移出游戏，并获得一张至多比该牌费用多3的牌。',
        jaeffect:'あなたの手札のカード1枚を廃棄する。\n廃棄したカードよりもコストが\n最大③まで多いカード1枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'5',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title:  that.chname,
            	content:  "请选择要废弃的牌",
            	area:  "hand",
            	min:  1,
            	max:  1
            });
            let cost = Number(user.hand[cardkey[0]].cost) + 3;
            user.trash(cardkey,'hand');
            cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: `请选择要获得的费用最多为${cost}的牌`,
            	area: "kingdom",
            	min: 1,
            	max: 1,
              myFilter: (card) =>{return card.cost <= cost;}
            });
            cardkey = cardkey[0];
            await user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
            console.log(cardkey);
        }
    },{
        number:11,
        chname:'秘神流雏「键山雏」',
        janame:'秘神流し雛「鍵山雛」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'2',
        cheffect:'购买次数 +1 金钱 +1 ',
        jaeffect:'+1　カードを購入\n　+①',
        eneffect:'',
        chspecial:'当这张牌被从你的行动区置入弃牌堆时，你可以将你行动区的一张资源牌置于你的牌堆顶。',
        jaspecial:'あなたはこのカードをプレイエリアから捨て札に置くとき、プレイエリアにある自分のリソースカード1枚を自分のデッキの一番上に置いてもよい。',
        enspecial:'',
        remark:'',
        stage:'2'
    },{
        number:12,
        chname:'风神之湖',
        janame:'風神の湖',
        enname:'',
        expansion:'风神录',
        types:['行动', '胜利点'],
        cost:'6',
        cheffect:'从下列两项中选择一项：「手牌 +3」；「行动次数 +2」。',
        jaeffect:'次のうち１つを選ぶ:「+３　カードを引く」;\n「+２　アクション」',
        eneffect:'',
        chspecial:'2 胜利点',
        jaspecial:'勝利点　２',
        enspecial:'',
        remark:'',
        stage:'6',
        vp:2,
        use:async (user,f,that)=>{
            let choices = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择以下的一项：",
            	area: "check",
            	min: 1,
            	max: 1,
              myFilter: ["「手牌 +3」", "「行动次数 +2」"]
            });
            if(choices[0]) {user.draw(3);
            f.sendRep(user.socket,user,`手牌+3`);}
            if(choices[1]) {user.gainAction(2)
            f.sendRep(user.socket,user,`行动+2`);}
        }
    },{
        number:13,
        chname:'丰符「Otoshi Harvester」',
        janame:'豊符「オヲトシハーベスター」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +5 弃置3张手牌。',
        jaeffect:'+５　カードを引く\nカード３枚を捨て札にする。',
        eneffect:'',
        chspecial:'当你获得这张卡时，其他所有玩家每人获得一张「奉纳米」。',
        jaspecial:'このカードを獲得するとき、他のプレイヤーは全員、「奉納米」１枚を獲得する。',
        enspecial:'',
        remark:'',
        stage:'1',
        use:async (user,f,that)=>{
            user.draw(5);
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要弃置的牌",
            	area:  "hand",
            	min: 3,
            	max: 3
            });
            user.drop(cardkey,'hand');
            console.log(cardkey);
        },
        onGain:async (user,f,that) =>{
          let otherUsers = Object.keys(f.rooms[user.room].users)
          .map(key => f.rooms[user.room].users[key])
          .filter(otherUser => !(otherUser.socket.username === user.socket.username));// for ordering
          let promises = otherUsers.map(user => user.gainCard('drops','basic',1,'gain'));
          await Promise.all(promises);
        }
    },{
        number:14,
        chname:'被祭祀的风之人类「东风谷早苗」',
        janame:'祀られる風の人間「東風谷早苗」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'4',
        cheffect:'将一张「お賽銭」从你的手牌中移出游戏。若如此做，金钱 +3。',
        jaeffect:'あなたの手札から「お賽銭」１枚を廃棄する。\nそうした場合、+③を使用できる。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'5',
        use:async (user,f,that)=>{
            let myFilter = (card) => {console.log(card.src,card.index);return card.src === 'basic' && card.index === 0;};
            let cardkey = await f.ask({
              	socket: user.socket,
              	title: that.chname,
              	content: "请选择手牌中的一张「お賽銭」",
              	area:  "hand",
              	min: 0,
              	max: 1,
                myFilter: myFilter,
              });
          cardkey.filter(myFilter);
          if(cardkey.length > 0){
            user.trash(cardkey,'hand');
            user.gainMoney(3);
          }
            console.log(cardkey);
        },
    },{
        number:15,
        chname:'守矢神社',
        janame:'守矢神社',
        enname:'',
        expansion:'风神录',
        types:['行动', '胜利点'],
        cost:'3',
        cheffect:'手牌 +1 行动次数 +1',
        jaeffect:' +１　カードを引く\n+1　アクション',
        eneffect:'',
        chspecial:'1 胜利点',
        jaspecial:'勝利点　１',
        enspecial:'',
        remark:'',
        stage:'5',
        vp:1,
        use:(user)=>{
          user.draw(1);
          user.gainAction(1);
        }
    },{
        number:16,
        chname:'丰裕与收成的象征「秋穰子」',
        janame:'豊かさと稔りの象徴「秋穣子」',
        enname:'',
        expansion:'风神录',
        types:['行动', '持续'],
        cost:'5',
        cheffect:'现在以及下一回合开始时，金钱 +2。',
        jaeffect:'現在と、あなたの次のターンの開始時に: +②',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1'
    },{
        number:17,
        chname:'broken amulet',
        janame:'ブロークンアミュレット',
        enname:'',
        expansion:'风神录',
        types:['资源'],
        cost:'5',
        cheffect:'3 金钱 购买次数 +1 当你使用这张牌时，你左边的玩家指定一张牌。你这回合不能买这张指定的牌。',
        jaeffect:'③\n+１カードを購入\nこのカードを使うとき、あなたの左隣のプレイヤーはカード１枚を指定する。このターン、あなたは指定されたカードを購入できない。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'2'
    },{
        number:18,
        chname:'寂寞与终焉的象征「秋静叶」',
        janame:'寂しさと終焉の象徴「秋静葉」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'3',
        cheffect:'手牌 +1 行动次数 +1 金钱 +1 弃置一张手牌。',
        jaeffect:' +１　カードを引く\n+1　アクション\n+①\nカード１枚を捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1',
        use:async (user,f,that)=>{
            user.draw(1);
            user.gainAction(1);
            user.gainMoney(1);
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要弃置的牌",
            	area:  "hand",
            	min: 1,
            	max:  1
            });
            user.drop(cardkey,'hand');
            console.log(cardkey);
        },
    },{
        number:19,
        chname:'山坂与湖水的化身「八坂神奈子」',
        janame:'山坂と湖の権化「八坂神奈子」',
        enname:'',
        expansion:'风神录',
        types:['行动'],
        cost:'6',
        cheffect:'从你的牌堆顶上依次翻牌直至翻出2张资源牌。将这两张资源牌加入你的手牌，其余弃置。',
        jaeffect:'あなたのデッキからリソースカード２枚が公開されるまで、カードを公開する。\n公開したリソースカード２枚を手札に加え、他の公開したカードは捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6',
        use:async (user,f,that)=>{
            let show = user.show(1);
            let resource = [];
            await user.showCard([show.length - 1],'deck');
            while(resource.length < 2){
              !show[show.length - 1].types.includes("胜利点")
              && !show[show.length - 1].types.includes("负分")
              show.push(user.show(1)[0]);
              await user.showCard([show.length - 1],'deck');
            }
            show.pop();
            user.drop(show.map((c,i) => i),'deck');
        }
    },{
        number:20,
        chname:'筒粥神事',
        janame:'筒粥神事',
        enname:'',
        expansion:'风神录',
        types:['资源'],
        cost:'7',
        cheffect:'当你使用这张牌时，包括这张牌，你的行动区里每有一张资源牌，这张牌的价值就多1 金钱。',
        jaeffect:'このカードを使うとき、このカードを含めて\nあなたがプレイエリアに出している\nリソースカード１枚につき①の価値がある。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6',
        use:(user)=>{
          user.gainMoney(user.actionArea.filter((card) => {return card.types.includes('资源');}).length);
        }
    }],
    [{
        number:1,
        chname:'熱かい悩む神の火「霊烏路空」',
        janame:'难以驾驭的神之火「灵乌路空」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'4',
        cheffect:'你可以将你手牌中1张行动牌使用2次。将该牌移出游戏。获得1张比该牌费用正好高1的行动牌。',
        jaeffect:'あなたの手札のアクションカード1枚を2度使用してもよい。そのカードを廃棄する。そのカードよりコストがちょうど1多いアクションカード1枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6'
    },{
        number:2,
        chname:'恐るべき井戸の怪「キスメ」',
        janame:'可怕的水井妖怪「琪斯美」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'3',
        cheffect:'将你的1张手牌移出游戏。获得比该牌费用正好高1与低1的牌各1张，并以任意顺序置于你的牌堆顶。',
        jaeffect:'あなたの手札を1枚を廃棄する。そのカードよりコストがちょうど1多いカード1枚と、ちょうど1少ないカード1枚を獲得し、好きな順番であなたのデッキの上に置く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1'
    },{
        number:3,
        chname:'怨霊も恐れ怯む少女「古明地さとり」',
        janame:'怨灵也为止惧怯的少女「古明地觉」',
        enname:'',
        expansion:'地灵殿',
        types:['行动', '攻击'],
        cost:'3',
        cheffect:'各名玩家（包括你）展示自己牌堆顶的2张牌，由你从下列两项中选择1项：「弃置公开的2张牌。」；「每人按照任意顺序将其放回牌堆顶。」 手牌+2',
        jaeffect:'各プレイヤー（あなたを含む）は、自分のデッキの上から2枚を公開し、次のうち1つをあなたが選ぶ：「公開した2枚とも捨て札にする。」；「自分の好きな順番で自分のデッキの上に戻す。」 +2 カードを引く',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'4'
    },{
        number:4,
        chname:'怪奇「釣瓶落としの怪」',
        janame:'怪奇「钓瓶落之怪」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'4',
        cheffect:'执行以下行动2次：将你的一张手牌移出游戏，获得1张比移出游戏的牌费用高1的牌。',
        jaeffect:'以下を2度実行する：あなたの手札からカード1枚を廃棄する。廃棄したカードよりもコストが1多いカード1枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1',
        use:async (user,f,that)=>{
            for(let time = 0; time < 2; time += 1){
                let cardkey = await f.ask({
                	socket: user.socket,
                	title:  that.chname,
                	content:  "请选择要废弃的牌",
                	area:  "hand",
                	min:  1,
                	max:  1
                });
                let cost = Number(user.hand[cardkey[0]].cost) + 1;
                user.trash(cardkey,'hand');
                cardkey = await f.ask({
                	socket: user.socket,
                	title: that.chname,
                	content: `请选择要获得的费用为${cost}的牌`,
                	area: "kingdom",
                	min: 0,
                	max: 1,
                  myFilter: (card) =>{return Number(card.cost) === cost;}
                });
                cardkey = cardkey[0];
                await user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
                console.log(cardkey);
            }
        }
    },{
        number:5,
        chname:'奇跡「ミラクルフルーツ」',
        janame:'奇迹「神秘果」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'5',
        cheffect:'金钱 +3 将你的1张手牌置于你的牌堆顶。',
        jaeffect:'+ ③ あなたの手札のカード1枚をあなたのデッキの一番上に置く。',
        eneffect:'',
        chspecial:'你获得这张牌的时候，将你行动区的所有资源牌以任意顺序置于你的牌堆顶。',
        jaspecial:'あなたはこのカードを獲得するとき、あなたのプレイエリアに出ているすべてのリソースカードをあなたのデッキの上に好きな順番で置く。',
        enspecial:'',
        remark:'',
        stage:'ex'
    },{
        number:6,
        chname:'語られる怪力乱神「星熊勇儀」',
        janame:'人所谈论的怪力乱神「星熊勇仪」',
        enname:'',
        expansion:'地灵殿',
        types:['行动', '响应'],
        cost:'3',
        cheffect:'手牌 +1 行动次数 +1 购买次数 +1',
        jaeffect:'+1 カードを引く +1 アクション +1 カードを購入',
        eneffect:'',
        chspecial:'你的一张牌被移出游戏的时候，可以从手牌中将这张牌弃置。若如此做，你获得一张「御神酒」。',
        jaspecial:'あなたのカード1枚を廃棄するとき、貴方は手札からこのカードを捨て札にしてもよい。そうした場合、「御神酒」1枚を獲得する。',
        enspecial:'',
        remark:'',
        stage:'3',
        use: (user,f,that) =>{
          user.draw(1);
          user.gainAction(1);
          user.gainBuy(1);
        },
        onGain:(user,f,that)=>{
            user.onLost[that.id] = {
                from: that,
                func: async (user,f,that,card,to)=>{
                  if(!(user.hand.includes(that))) return;
                  if(await f.ask({
                  	socket: user.socket,
                  	title: that.chname,
                  	content: `是否弃置${that.chname}并获得一张酒？`,
                  	area:  'yn',
                  })){
                    user.drop(user.hand.indexOf(that),'hand');
                    user.gainCard('drops','basic',2,'gain');
                    f.sendRep(user.socket,user,`${user.socket.username}弃置了${that.chname}并获得了酒`);
                  }
                }
            };
        },
    },{
        number:7,
        chname:'暗い洞窟の明るい網「黒谷ヤマメ」',
        janame:'昏暗洞窟中明亮的网「黑谷山女」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'3',
        cheffect:'行动次数 +1 购买机会 +1 将你的1张手牌移出游戏。所有移出游戏的牌中每有1张不同名字的资源牌，金钱+1。',
        jaeffect:'+1 アクション +1 カードを購入 あなたの手札からカード1枚を廃棄する。 廃棄置き場にある異なるカード名のリソース1枚につき+①',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'1'
    },{
        number:8,
        chname:'「地獄極楽メルトダウン」',
        janame:'「地狱极乐熔毁」',
        enname:'',
        expansion:'地灵殿',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'所有其他玩家从牌堆顶依次翻牌直到出现费用3或以上的牌。将该牌移出游戏。这名玩家可以从补给区获得比该牌费用低至少2的1张牌。其余弃置。',
        jaeffect:'他のプレイヤーは全員、自分のデッキからコスト③以上のカードが出るまで（上から順に）公開し、そのカードを廃棄する。そのプレイヤーは、サプライからそのカードよりもコストが②以上少ないカード1枚を獲得してもよい。公開した残りのカードは各プレイヤーの捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'6'
    },{
        number:9,
        chname:'呪精「ゾンビフェアリー」',
        janame:'咒精「僵尸妖精」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +2 行动次数 +2 弃置2张手牌',
        jaeffect:'+2 カードを引く +2 アクション カード2枚を捨て札にする。',
        eneffect:'',
        chspecial:'你获得这张牌的时候，观看你弃牌堆中所有牌（包括这张牌），从中展示任意数量的行动牌，加入你的牌堆中，之后牌堆洗牌。',
        jaspecial:'このカードを獲得するとき、あなたの捨て札すべて（このカードを含む）を見て、その中から好きな枚数のアクションカードを公開し、あなたのデッキに加えて、デッキをシャッフルする。',
        enspecial:'',
        remark:'',
        stage:'5'
    },{
        number:10,
        chname:'想起「テリブルスーヴニール」',
        janame:'回忆「恐怖的回忆」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'2',
        cheffect:'金钱 +2 将这张牌移出游戏。在补给区任意一个牌堆上方放置1枚心病代币。',
        jaeffect:'+ ② このカードを廃棄する。サプライのいずれかの山札1つの上に、トラウマトークン1枚を配置する。',
        eneffect:'',
        chspecial:'玩家购入牌的时候，这种牌的牌堆上每置有1枚心病代币，就要获得1张负分牌。',
        jaspecial:'プレイヤーはカードを購入するとき、その山札に置いてあるトラウマトークン1枚につき、マイナスカード1枚を獲得する。',
        enspecial:'',
        remark:'',
        stage:'4'
    },{
        number:11,
        chname:'地殻の下の嫉妬心「水橋パルスィ」',
        janame:'地壳下的嫉妒心「水桥帕露西」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'1',
        cheffect:'金钱 +4 展示你的手牌。你的手牌中每有一张资源牌，金钱-1，但是不会使金钱降为0以下。',
        jaeffect:'+ ④ あなたのカードを公開する。あなたの手札のリソースカード1枚につき-①。 ただし⓪未満にはならない。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'2',
        use:async (user,f,that)=>{
            user.showCard('all');
            let money = 4;
            user.hand.forEach((card) => {if(card.types.includes('资源')) money -= 1;});
            money = money > 0 ? money : 0;
            user.gainMoney(money);
            f.sendRep(user.socket,user,`${user.socket.username}获得了金钱+${money}`);
        }
    },{
        number:12,
        chname:'力業「大江山颪」',
        janame:'力业「大江山颪」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +1 行动次数 +1',
        jaeffect:'+1 カードを引く +1 アクション',
        eneffect:'',
        chspecial:'只要这张牌存在于行动区，牌的费用少1（但是不会降到0以下）。',
        jaspecial:'このカードがプレイエリアに出ているかぎり、カードのコストは①少なくなる（ただし⓪未満にはならない）。',
        enspecial:'',
        remark:'',
        stage:'3'
    },{
        number:13,
        chname:'地霊殿',
        janame:'地灵殿',
        enname:'',
        expansion:'地灵殿',
        types:['胜利点'],
        cost:'6',
        cheffect:'2 胜利点',
        jaeffect:'2 勝利点*',
        eneffect:'',
        chspecial:'你购入这张牌的时候，将你的1张手牌移出游戏。获得1张比移出游戏的牌费用正好高2的牌。',
        jaspecial:'あなたがこのカードを購入するとき、あなたの手札のカード1枚を廃棄する。廃棄したカードよりもコストがちょうど②多いカード1枚を獲得する。',
        enspecial:'',
        remark:'',
        stage:'4',
        vp:2,
        use:false,
        onGain:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title:  that.chname,
            	content:  "请选择要废弃的牌",
            	area:  "hand",
            	min:  1,
            	max:  1
            });
            let cost = Number(user.hand[cardkey[0]].cost) + 2;
            user.trash(cardkey,'hand');
            cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: `请选择要获得的费用最多为${cost}的牌`,
            	area: "kingdom",
            	min: 0,
            	max: 1,
              myFilter: (card) => {return card.cost <= cost;}
            });
            if(cardkey.length < 1) return;
            cardkey = cardkey[0];
            user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
        }
    },{
        number:14,
        chname:'閉じた恋の瞳「古明地こいし」',
        janame:'紧闭的恋之瞳「古明地恋」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'5',
        cheffect:'行动次数 +1 从下列3项中选择1项：你获得括号内的效果：「所有玩家手牌+1（+3）。」；「所有玩家获得1张「奉纳米」（「御神酒」）。」；「所有玩家可以将1张手牌移出游戏，获得1张比移出游戏的牌费用高1（2）的牌。」',
        jaeffect:'+1 アクション 次のうち1つ選ぶ：あなたは（）内の効果を得る：「すべてのプレイヤーは+1（+3）カードを引く。」；「すべてのプレイヤーは「奉納米」（「御神酒」）1枚を獲得する。」；「すべてのプレイヤーは自分の手札からカード1枚を廃棄してもよい。廃棄したカードよりもコストが①（②）多いカード1枚を獲得する。」',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'ex'
    },{
        number:15,
        chname:'妬符「グリーンアイドモンスター」',
        janame:'妒符「绿眼怪兽」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'4',
        cheffect:'手牌 +1 行动次数 +1 获得1张「妒符「绿眼怪兽」」。你从手牌将1张「妒符「绿眼怪兽」」以外的牌移出游戏（手牌全都是「妒符「绿眼怪兽」」的场合公开手牌）。',
        jaeffect:'+1 カードを引く +1 アクション 「妬符「グリーンアイドモンスター」」1枚を獲得する。あなたの手札から「妬符「グリーンアイドモンスター」」以外のカード1枚を廃棄する（すべて「妬符「グリーンアイドモンスター」」の場合は手札を公開する）。',
        eneffect:'',
        chspecial:'你将这张牌移出游戏的时候，手牌+1。',
        jaspecial:'あなたはこのカードを廃棄したとき、+1カードを引く。',
        enspecial:'',
        remark:'',
        stage:'2'
    },{
        number:16,
        chname:'復燃「恋の埋火」',
        janame:'复燃「恋爱的埋火」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'4+',
        cheffect:'手牌 +1 行动次数 +1 展示你牌堆顶的1张牌。 如果它是行动牌，那么执行这张牌。',
        jaeffect:'+1 カードを引く +1 アクション あなたのデッキの一番上のカードを公開する。 それがアクションの場合、そのカードをプレイする。',
        eneffect:'',
        chspecial:'你购入这张牌的时候，可以花费额外的费用。每额外花1金钱，可以观看自己弃牌堆的所有牌，并将其中1张牌置于你的牌堆顶。',
        jaspecial:'あなたがこのカードを購入するとき、追加でコストを支払ってもよい。追加で払ったコスト①につき、自分の捨て札のカードすべてを見てその中1枚を、あなたのデッキの一番上に置く。',
        enspecial:'',
        remark:'',
        stage:'ex'
    },{
        number:17,
        chname:'罠符「キャプチャーウェブ」',
        janame:'罠符「捕捉之网」',
        enname:'',
        expansion:'地灵殿',
        types:['行动', '响应'],
        cost:'2',
        cheffect:'弃置任意张手牌，每弃置1张手牌，你获得金钱+1。',
        jaeffect:'好きな枚数のカードを捨て札にする。 捨て札にしたカード1枚につき+①',
        eneffect:'',
        chspecial:'其他玩家使用攻击牌的时候，可以从手牌公开这张牌。若如此做，手牌+2，之后从你的手牌中选2张放到你的牌堆顶。',
        jaspecial:'他のプレイヤーがアタックカードを使用した時、手札からこのカードを公開できる。そうした場合、+2カードを引く。その後あなたの手札からカード2枚を選び、あなたのデッキの上に置く。',
        enspecial:'',
        remark:'',
        stage:'1',
        use: async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "弃置任意张手牌，每张+1钱",
            	area: "hand",
            	min: 0,
            	max:  MAX_INT
            });
            if(cardkey[0] !== undefined){
              user.drop(cardkey, "hand");
              user.gainMoney(cardkey.length);
              f.sendRep(user.socket,user,`获得了${cardkey.length}金钱`);
            }
            console.log(cardkey);
        },
        onAttack: async (user,f,that,card)=>{
          if(await f.ask({
            socket: user.socket,
            title: that.chname,
            content: `是否展示${that.chname}并手牌+2、放回2张牌到牌堆顶？`,
            area:  'yn'
          })){
            user.showCard([user.hand.indexOf(that)]);
            user.draw(2);
            let cardkey = await f.ask({
              socket: user.socket,
              title: that.chname,
              content: `请选择要放回牌堆顶的2张牌`,
              area: "hand",
              min: 2,
              max: 2
            });
            user.drop(cardkey,'hand','deck','top');
          }
      }
    },{
        number:18,
        chname:'地獄の輪禍「火焔猫燐」',
        janame:'地狱的轮祸「火焰猫燐」',
        enname:'',
        expansion:'地灵殿',
        types:['行动'],
        cost:'5',
        cheffect:'观看你的牌堆顶的3张牌，从下列两项中选择1项：「将这三张牌加入你的手牌。」；「将这3张牌弃置，手牌+3。」',
        jaeffect:'あなたのデッキの上から3枚のカードをみる。次のうち1つを選ぶ：「その3枚をあなたの手札の加える。」；「その3枚を捨て札にし、+3カードを引く。」',
        eneffect:'',
        chspecial:'将这张牌移出游戏的时候，获得1张比这张牌费用少的牌。',
        jaspecial:'このカードを廃棄したとき、このカードよりもコストが少ないカード1枚を獲得する。',
        enspecial:'',
        remark:'',
        stage:'5'
    },{
        number:19,
        chname:'地霊湧き出す間欠泉',
        janame:'地灵涌出的间歇泉',
        enname:'',
        expansion:'地灵殿',
        types:['响应', '地灵'],
        cost:'1',
        cheffect:'',
        jaeffect:'-',
        eneffect:'',
        chspecial:'你购入1张胜利点牌的时候，你可以从手牌中将这张牌移出游戏。',
        jaspecial:'あなたが勝利点カード1枚を購入するとき、あなたは手札からこのカード廃棄してもよい。',
        enspecial:'',
        remark:'',
        stage:'ed'
    },{
        number:20,
        chname:'地霊漂う社殿',
        janame:'地灵漂浮的社殿',
        enname:'',
        expansion:'地灵殿',
        types:['胜利点', '地灵'],
        cost:'1',
        cheffect:'0 胜利点',
        jaeffect:'0 勝利点*',
        eneffect:'',
        chspecial:'你将这张牌移出游戏的时候，手牌+1。',
        jaspecial:'あなたはこのカードを廃棄するとき、+1カードを引く。',
        enspecial:'',
        remark:'',
        stage:'ed'
    },{
        number:21,
        chname:'地霊賑わう旧都',
        janame:'地灵繁荣的旧都',
        enname:'',
        expansion:'地灵殿',
        types:['行动', '地灵'],
        cost:'1',
        cheffect:'行动次数 +2',
        jaeffect:'+2 アクション',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'3'
    }],
    [{
        number:1,
        chname:'萃集梦想、虚幻、以及百鬼夜行「伊吹萃香」',
        janame:'萃まる夢、幻、そして百鬼夜行「伊吹萃香」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动'],
        cost:'5',
        cheffect:'金钱 +2 ',
        jaeffect:'',
        eneffect:'',
        chspecial:'当这张牌出现在行动区，购入一张牌时，获得一张比购入的这张牌费用低的胜利点以外的牌。',
        jaspecial:'このカードがプレイエリアに出ているかぎり、カード１枚を購入するとき、購入したカードよりもコストが少ない勝利点以外のカード１枚を獲得する。',
        enspecial:'',
        remark:'',
        stage:''
    },{
        number:2,
        chname:'当代的念写记者「姬海棠果」',
        janame:'今どきの念写记者「姫海棠はたて」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +1 行动次数 +1 观看你的牌堆最上方的4张牌。从其中选择任意枚数放入弃牌堆，剩余牌以任意顺序置于牌堆顶。',
        jaeffect:'あなたのデッキの上から４枚のカードを見る。その中から好きな枚数を捨て札にする。残りを好きな順番でデッキの上に置く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:''
    },{
        number:3,
        chname:'有顶天',
        janame:'有頂天',
        enname:'',
        expansion:'特别扩展篇',
        types:['胜利点'],
        cost:'4',
        cheffect:'你的牌堆每存在4张胜利点牌（舍去余数），获得1点胜利点。',
        jaeffect:'あなたのデッキにある勝利点カード４枚（端数切り捨て）につき１勝利点を得る。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'',
        vp: 0,
        use:false,
        onGain:(user,f,that)=>{
          let obj = factor => {
            return {
             from: that,
             func: (user,f,that,card) => {
                if(!card.types.includes('胜利点')) return;
                let shoriten = user.hand.concat(user.drops,user.deck,user.actionArea,user.duration)
                  .filter(myCard => myCard.types.includes('胜利点')).length + factor * 1;
                if(shoriten / 4 !== that.vp){
                    user.vp -= that.vp;
                    that.vp = Math.floor(shoriten / 4);
                    user.vp += that.vp;
                }
              }
            }};
          user.onGain[that.id] = obj(0);
          user.onLost[that.id] = obj(-1);
        },
    },{
        number:4,
        chname:'美丽的绯之衣「永江衣玖」',
        janame:'美しき绯の衣「永江衣玖」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动'],
        cost:'4',
        cheffect:'获得费用最大为4的一张牌。如果获得的牌是以下类型的场合：行动牌则行动次数+1,资源牌则金钱+1，胜利点牌则手牌+1。',
        jaeffect:'コスト最大④までのカード１枚を獲得する。獲得したカードが… アクションカードの場合、＋１ アクション  リソースカードの場合、＋① 勝利点カードの場合、＋１ カードを引く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择要获得的费用最多为4的牌",
            	area: "kingdom",
            	min: 1,
            	max: 1,
              myFilter: (card) =>{return card.cost <= 4;}
            });
            if(cardkey.length !== 1) return;
            cardkey = cardkey[0];
            await user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
            console.log(cardkey);
            let types = f.rooms[user.room][cardkey.src][cardkey.index].types;
            if(types.includes('行动')){
              user.gainAction(1);
            }
            if(types.includes('资源')){
              user.gainMoney(1);
            }
            if(types.includes('胜利点')){
              user.draw(1);
            }
        }
    },{
        number:5,
        chname:'闪耀的日之光「桑尼米尔克」',
        janame:'輝ける日の光「サニーミルク」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动', '攻击'],
        cost:'3',
        cheffect:'金钱 +2  其他所有玩家，从自己的牌堆里不断展示手牌，直到展示出胜利点或负分牌。该牌放置在自己的牌堆最上方，其余牌进入弃牌堆。',
        jaeffect:'他のプレイヤーは全員、自分の山札から勝利点またはマイナスカード１枚が公開されるまでカードを公開する。公開した勝利点またはマイナスカードを自分の山札の一番上に置き、他の公開したカードは捨て札にする。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'',
        use:async (user,f,that)=>{
            user.gainMoney(2);
            let otherUsers = Object.keys(f.rooms[user.room].users)
              .map(key => f.rooms[user.room].users[key])
              .filter(otherUser => !(otherUser.socket.username === user.socket.username));// for ordering
            let promises = otherUsers.map(user => (async (user) => {
              await user.attacked(that);
              if(user.affect){
                let show = user.show(1);
                await user.showCard([show.length - 1],'deck');
                while(!show[show.length - 1].types.includes("胜利点")
                && !show[show.length - 1].types.includes("负分")){
                  show.push(user.show(1)[0]);
                  await user.showCard([show.length - 1],'deck');
                }
                show.pop();
                user.drop(show.map((c,i) => i),'deck');
              }
              user.affect = true;
            })(user));
            await Promise.all(promises);
        }
    },{
        number:6,
        chname:'三途河畔的摆渡人「小野塚小町」',
        janame:'三途の水先案内人「小野塚小町」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动', '攻击'],
        cost:'4',
        cheffect:'金钱 +1  这张牌被购买或者使用时，所有其他玩家展示自己牌堆最上方的两张牌，你选择其中的1张「奉纳米」或者「御神酒」移出游戏，其余的牌进入弃牌堆。展示的牌中一张资源牌都没的玩家，获得一张「赛钱」。你获得这张移出游戏的牌。',
        jaeffect:'このカードを購入または使用するとき、他のプレイヤーは全員自分のデッキの上から２枚のカードを公開し、公開された「奉纳米」または「御神酒」１枚をあなたが選んで廃棄し、残りを捨て札にする。リソースカードを１枚も公開しなかったプレイヤーは、「お賽銭」１枚を獲得する。あなたは廃棄したカードを獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:''
    },{
        number:7,
        chname:'四季的鲜花之主「風見幽香」',
        janame:'四季のフラワーマスター「風見幽香」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动', '攻击'],
        cost:'5',
        cheffect:'手牌 +3  所有其他玩家，从自己的牌堆上方展示三张牌，展示的牌中行动牌和资源牌进入弃牌堆，剩余的牌以任意顺序放回牌堆上。',
        jaeffect:'他のプレイヤーは全員、自分の山札の上から３枚のカードを公開し、公開したアクションとリソースカードを捨て札にし、残りのカードは好きな順番で山札の上に戻す。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'',
        use:async (user,f,that)=>{
            user.draw(3);
            let otherUsers = Object.keys(f.rooms[user.room].users)
              .map(key => f.rooms[user.room].users[key])
              .filter(otherUser => !(otherUser.socket.username === user.socket.username));// for ordering
            let promises = otherUsers.map(user => (async (user) => {
              await user.attacked(that);
              if(user.affect){
                let show = user.find(3).map((card,i)=>i);
                await user.showCard(show,'deck');
                let dropkey = show.filter(key => user.deck[key].types.includes('行动') || user.deck[key].types.includes('资源'));
                user.drop(dropkey,'deck');
                show = show.filter(key => !dropkey.includes(key));
                // 选择顺序
              }
              user.affect = true;
            })(user));
            await Promise.all(promises);
        }
    },{
        number:8,
        chname:'静谧的月之光「露娜切露德」',
        janame:'静かなる月の光「ルナチャイルド」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动', '持续'],
        cost:'3',
        cheffect:'金钱 +1 行动次数 +2；你的下一回合开始时，金钱 +1 行动次数 +1',
        jaeffect:'',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:''
    },{
        number:9,
        chname:'酒虫之壶',
        janame:'酒虫の壺',
        enname:'',
        expansion:'特别扩展篇',
        types:['资源'],
        cost:'6',
        cheffect:'金钱 +2 ',
        jaeffect:'',
        eneffect:'',
        chspecial:'当这张牌出现在行动区，你购入一张胜利点时，获得一张「御神酒」。',
        jaspecial:'このカードがプレイエリアに出ているかぎり、あなたは勝利点カード１枚を購入したとき、「御神酒」１枚を獲得する。',
        enspecial:'',
        remark:'',
        stage:'',
        use:(user)=>{user.gainMoney(2);},
        onGain:(user,f,that)=>{
          user.onGain[that.id] = {
              from:that,
              func: async (user,f,that,card)=>{
                if(!user.actionArea.includes(that)
              || !card.types.includes('胜利点')) return;
                await user.gainCard('drops','basic',2,'gain');
              }
          };
        }
    },{
        number:10,
        chname:'独臂有角的仙人「茨木華扇」',
        janame:'片腕有角の仙人「茨木華扇」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动'],
        cost:'4',
        cheffect:'你可以从手牌中将一张资源牌移出游戏。如此做的场合，选择以下一项：「手牌+2、行动次数+1」「金钱+2、购买次数+1」',
        jaeffect:'あなたは自分の手札のリソースカード１枚を廃棄してもよい。そうした場合、次のうち１つを選ぶ：「＋２ カードを引く、＋１ アクション」；「+②、＋１」',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'',
        use:async (user,f,that)=>{
            let cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: `请选择要废弃的一张资源牌`,
            	area: "hand",
            	min: 0,
            	max: 1,
              myFilter: (card) => {return card.types.includes('资源');}
            });
            if(cardkey.length <= 0) return;
            user.trash(cardkey,'hand');
            let choices = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: "请选择一项：",
            	area: "check",
            	min:  1,
            	max:  1,
              myFilter: ["「手牌+2、行动次数+1」", "「金钱+2、购买次数+1」"]
            });
            if(choices[0]) {user.draw(2);user.gainAction(1);f.sendRep(user.socket,user,`手牌+2、行动次数+1`);}
            if(choices[1]) {user.gainMoney(2);user.gainBuy(1);f.sendRep(user.socket,user,`金钱+2、购买次数+1`);}
        }
    },{
        number:11,
        chname:'小小的甜蜜毒药「梅蒂欣·梅兰可莉」',
        janame:'小さなスイートポイズン「メディスン·メランコリー」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动', '持续'],
        cost:'2',
        cheffect:'行动次数 +1；当前和你的下个回合开始时，金钱 +1',
        jaeffect:'',
        eneffect:'',
        chspecial:'当这张牌出现在行动区，其他玩家使用攻击牌时，你不受其效果影响。',
        jaspecial:'このカードがプレイエリアに出ているかぎり、他のプレイヤーがアタックカードを使用しても、あなたはそのカードの影響を受けない。',
        enspecial:'',
        remark:'',
        stage:''
    },{
        number:12,
        chname:'传统的幻想书屋「射命丸文」',
        janame:'伝統の幻想ブン屋「射命丸文」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +2  将任意张手牌移入弃牌堆，每弃一张牌，获得金钱+1。所有其他玩家，可以弃置2张手牌，若如此做，该玩家手牌+1。',
        jaeffect:'好きな枚数のカードを捨て札にする。捨て札にしたカード１枚につき＋①。他のプレイヤーは全員、カード２枚を捨て札にしてもよい。そうした場合、そのプレイヤーはカード１枚を引く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'',
        use: async (user,f,that)=>{
            user.draw(2);
            let promises = [(async () => {
              let cardkey = await f.ask({
              	socket: user.socket,
              	title: that.chname,
              	content: "弃置任意张手牌，每张+1钱",
              	area: "hand",
              	min: 0,
              	max:  MAX_INT
              });
              if(cardkey.length > 0){
                user.drop(cardkey, "hand");
                user.gainMoney(cardkey.length);
                f.sendRep(user.socket,user,`获得了${cardkey.length}金钱`);
              }
          })()];

            let otherUsers = Object.keys(f.rooms[user.room].users)
            .map(key => f.rooms[user.room].users[key])
            .filter(otherUser => !(otherUser.socket.username === user.socket.username
              || otherUser.hand.length < 2));// for ordering
            promises = promises.concat(otherUsers.map(otherUser => (async (otherUser) => {
              let cardkey = await f.ask({
                socket: otherUser.socket,
                title: that.chname,
                content: `请选择要弃置的2张牌，之后可以抽1张牌；或者不选择手牌。`,
                area: "hand",
                min: 0,
                max: 2
              });
              if(cardkey.length === 2){
                otherUser.drop(cardkey,'hand');
                otherUser.draw(1);
                f.sendRep(user.socket,user,`${otherUser.socket.username}弃置了2张手牌`);
              }
          })(otherUser)));

          await Promise.all(promises);
        }
    },{
        number:13,
        chname:'非想非非想天之女「比那名居天子」',
        janame:'非想非非想天の娘「比那名居天子」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动'],
        cost:'4',
        cheffect:'购买次数 +1  你可以将一张「博麗神社 ～間借りの一画（胜利点1）」放入弃牌堆。若如此做，获得金钱+4。没有弃牌的场合，获得一张「博麗神社 ～間借りの一画」。',
        jaeffect:'あなたは、「博麗神社 ～間借りの一画」１枚を捨て札にしてもよい。そうした場合、＋④。捨て札にしなかった場合、「博麗神社 ～間借りの一画」１枚獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'',
        use:async (user,f,that) =>{
          user.gainBuy(1);
          let cardkey = await f.ask({
            socket: user.socket,
            title: that.chname,
            content: "请选择弃置的1分，或者不选择以获得1分",
            area: "hand",
            min: 0,
            max: 1,
            myFilter: card => {return card.chname === '神社';}
          });
          if(cardkey.length < 1){
            await user.gainCard('drops','basic',3,'gain');
          }
          else {
            user.gainMoney(4);
          }
        }
    },{
        number:14,
        chname:'倾泻而下的星之光「斯塔萨菲雅」',
        janame:'降り注ぐ星の光「スターサファイヤ」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动'],
        cost:'3',
        cheffect:'手牌 +1 行动次数 +1  本轮清理阶段开始时，你可以选择1张在行动区里的行动牌，该回合这张牌将进入弃牌堆时，把它放置在你的牌堆顶上。',
        jaeffect:'このターンのクリーンアップフェイズの開始時に、あなたはプレイエリアに出ているアクションカード１枚を選んでもよい。このターンあなたがそのカードをプレイエリアから捨て札に置く場合、そのカードをあなたのデッキの一番上に置く。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:''
    },{
        number:15,
        chname:'无缘塚',
        janame:'無縁塚',
        enname:'',
        expansion:'特别扩展篇',
        types:['胜利点', '响应'],
        cost:'3',
        cheffect:'胜利点 2',
        jaeffect:'',
        eneffect:'',
        chspecial:'在你的清理阶段以外的情况弃置这张牌时，你可以展示这张牌，若如此做，获得1张「御神酒」。',
        jaspecial:'あなたがクリーンアップフェイズ以外の機会にこのカードを捨て札にするとき、あなたはこのカードを公開してもよい。そうした場合、「御神酒」１枚獲得する。',
        enspecial:'',
        remark:'',
        stage:''
    },{
        number:16,
        chname:'乐园的最高裁判长「四季映姫·亚玛萨那度」',
        janame:'楽园の最高裁判長「四季映姫・ヤマザナドゥ」',
        enname:'',
        expansion:'特别扩展篇',
        types:['行动'],
        cost:'5',
        cheffect:'手牌 +1 行动次数 +1  从你的手牌中将一张牌移出游戏。获得一张比移出游戏的牌费用多①的牌。',
        jaeffect:'あなたの手札からカード１枚を廃棄する。廃棄したカードよりコストが①多いカード１枚を獲得する。',
        eneffect:'',
        chspecial:'',
        jaspecial:'',
        enspecial:'',
        remark:'',
        stage:'',
        use:async (user,f,that)=>{
            user.draw(1);
            user.gainAction(1);
            let cardkey = await f.ask({
            	socket: user.socket,
            	title:  that.chname,
            	content:  "请选择要废弃的牌",
            	area:  "hand",
            	min:  1,
            	max:  1
            });
            let cost = Number(user.hand[cardkey[0]].cost) + 1;
            user.trash(cardkey,'hand');
            cardkey = await f.ask({
            	socket: user.socket,
            	title: that.chname,
            	content: `请选择要获得的费用为${cost}的牌`,
            	area: "kingdom",
            	min: 0,
            	max: 1,
              myFilter: (card) =>{return card.cost === cost;}
            });
            if(cardkey.length === 0) return;
            cardkey = cardkey[0];
            await user.gainCard('drops', cardkey.src, cardkey.index, 'gain');
            console.log(cardkey);
        }
    }],
    [{
        number:1,
        chname:'赛钱',
        janame:'「お賽銭」',
        expansion:'基础牌',
        types:['资源'],
        cost:0,
        use:(user)=>{user.gainMoney(1); }
    },{
        number:2,
        chname:'奉纳米',
        expansion:'基础牌',
        types:['资源'],
        cost:3,
        use:(user)=>{user.gainMoney(2);}
    },{
        number:3,
        chname:'御神酒',
        expansion:'基础牌',
        types:['资源'],
        cost:6,
        use:(user)=>{user.gainMoney(3); }
    },{
        number:4,
        chname:'神社',
        expansion:'基础牌',
        types:['胜利点'],
        cost:2,
        use:false,
        vp:1
    },{
        number:5,
        chname:'竹林',
        expansion:'基础牌',
        types:['胜利点'],
        cost:5,
        use:false,
        vp:3
    },{
        number:6,
        chname:'永远亭',
        expansion:'基础牌',
        types:['胜利点'],
        cost:8,
        use:false,
        vp:6
    },{
        number:7,
        chname:'屎',
        expansion:'基础牌',
        types:['负分'],
        cost:0,
        use:false,
        vp:-1
    }],
];
module.exports = cardSource;
