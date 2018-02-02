"use strict";

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
        this.name = props.name || {} ;
        this.expansion = props.expansion || '' ;
        this.types = props.types || [] ;
        this.cost = props.cost || 0 ;
        this.effect = props.effect || {} ;
        this.special = props.special || {} ;
        this.remark = props.remark || '' ;
        this.stage = props.stage || '' ;
        this.vp = props.vp || 0 ;
        this.use = props.use || undefined ;
        this.onGain = props.onGain || undefined;
        this.onAttack = props.onAttack || undefined;
        this.onTrash = props.onTrash || undefined;
    }
}

exports.Card = Card;
exports.DomCard = DomCard;
