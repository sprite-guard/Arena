var DEBUG = true;

class Component {
  constructor(name,els) {
    this.els = els;
    this.count = els.length;
    this.name = name;
  }
  
  add(items) {
    this.els.append(items);
    this.count = this.els.length;
    return this;
  }
  
  fetch(index) {
    var i = index % this.count;
    return this.els[i];
  }
}

var all_components = [
  new Component("pronoun",["He","She","Xe","They"]),
  new Component("hair_style",["braided",
                              "cropped",
                              "messy",
                              "flowing",
                              "matted"]),
  new Component("hair_color",["red","blue","white","black","brown","blonde","grey"]),
  new Component("build", ["stocky",
                          "slender",
                          "muscular",
                          "lithe",
                          "hefty",
                          "grizzled",
                          "gigantic",
                          "robust",
                          "tiny",
                          "spry",
                          "stout"]),
  new Component("weapon",["katana",
                          "broadsword",
                          "mace",
                          "morning star",
                          "club",
                          "halberd",
                          "spear",
                          "rapier",
                          "longsword",
                          "staff",
                          "balisong",
                          "tonfa",
                          "greatsword"])
  
];

var total_warrior_count = 1;
for(var c of all_components) {
  total_warrior_count *= c.count;
}

function warriorName(n) {
  var prefix = [ // 20
    "Mal",
    "Im",
    "Ton",
    "Per",
    "Dom",
    
    "Dil",
    "Yen",
    "Stal",
    "Tyr",
    "Met",
    
    "Nin",
    "Kan",
    "Khyr",
    "Shram",
    "Hau",
    
    "Vel",
    "Fir",
    "Pal",
    "Shin",
    "Cham"
  ],
  suffix = [ //7
    "sket",
    "stin",
    "sheng",
    "lo",
    "kar",
    "yu",
    "yat"
  ],
  sur_prefix = [ //11
    "Mok",
    "Sat",
    "Lop",
    "Nagat",
    "Holt",
    "Alek",
    "Maaset",
    "Menget",
    "Shalek",
    "Shek",
    "Tep"
  ],
  sur_suffix = [ //13
    "nam",
    "ori",
    "abi",
    "el",
    "ya",
    "enuk",
    "wang",
    "yan",
    "yun",
    "wei",
    "-Kar",
    "-Han",
    "-Beleth"
  ];
  
  return prefix[n%20]+suffix[n%7]+" "+sur_prefix[n%11]+sur_suffix[n%13];
}

var Script = {
  invocations: 0,
  insulted: () => {
    return [
      "denounced",
      "scorned",
      "forswore",
      "insulted",
      "cursed",
      "denied"
    ][ (Script.invocations++)%6 ];
  },
  
  favor: () => {
    return [
      "please",
      "mollify",
      "placate",
      "suck up to",
      "gain standing with",
      "save face before",
      "make nice with",
      "serve",
      "make a show of pleasing",
      "curry favor with",
      "better yourself in the eyes of"
    ][ (Script.invocations++)%11 ];
  }
};

class Insult {
  constructor(insult_id) {
    
  }
}

class Warrior {
  constructor(id) {
    all_components.map(c => {
      this[c.name] = c.fetch(id);
    });
    if(this.pronoun == "They") {
      this.s = "";
      this.was = "were";
    }
    else {
      this.s = "s";
      this.was = "was";
    }
    this.name = warriorName(id);
    this.alliances = [];
    this.grievances = [];
    this.id = id;
  }
  
  get description() {
    return `<p>${this.name} is a ${this.build} warrior with ${this.hair_color} ${this.hair_style} hair.<br />
${this.pronoun} wield${this.s} a ${this.weapon}.</p>`;
  }
  
  get litany() {
    var res = `<p>${this.name} says:</p>`;
    for(var grievance of this.grievances) {
      res += `<p>${grievance}</p>`;
    }
    return res;
  }
  
  get grievance_count() {
    return this.grievances.length;
  }
  
  alliance(other) {
    if(!this.alliances[other.id]) this.alliances[other.id] = ((this.id + other.id)%3)-1;
    return this.alliances[other.id];
  }

  alliance_by_id(id) {
    if(!this.alliances[id]) this.alliances[id] = ((this.id + id)%3)-1;
    return this.alliances[id];
  }
  
  add_grievance(other) {
    var beneficiary = other.current_opponent;
    this.grievances.push(`you ${Script.insulted()} me to ${Script.favor()} ${beneficiary.name}`);
    
    // we don't want this to become spammy
    if(this.grievance_count > 5) this.grievances.unshift();
  }
  
  offend(other) {
    
    // dismiss the other being offended
    var insult = new Insult( this.id + other.id, this.alliances[other.id]);
    document.write(`<p>${this.name} says, "${insult}"</p>`);

    this.alliance(other.id);
    other.alliance(this.id);
    
    this.alliances[other.id] -= 1;
    other.alliances[this.id] -= 1;
    
    other.add_grievance(new Grievance(this));
  }

  does_not_hate(other) {
    if(DEBUG) console.log(this.alliance(other));
    // initialize the reciprocal alliance
    other.alliance(this);
    if(this.alliance(other) >= -1) return true;
    else return false;
  }

  make_peace_offering(other) {
    for(var i = 0; i < total_warrior_count; i++) {
      if(!(i == this.id || i == other.id)) {
        if(this.alliance_by_id(i) < 0 && other.alliance_by_id(i) >= 0) {
          if(DEBUG) console.log("found point of disagreement: "+i);
          // this warrior asks the other warrior to forswear allegiance to a friend
          // in order to make a peaceful resolution to this encounter
          document.write( `<p>${this.name} says:<br />
"${other.name}! You still look favorably on ${warriorName(i)}.<br />
Foreswear your allegiance with that one, who has done great evil."</p>` );

          // other warrior has to consider the offer, and accept or reject.
          // nb this needs to be defined
          // it should return true if other accepts the offer.
          if(other.consider_offer(this.id,i)) {
            // worsen the relationship as requested, then improve the relationship between these two.
            document.write( `<p>${other.name} says:<br />
"It shall be done. ${warriorName(i)} means nothing to me."</p>` );
            other.insult(i);
            this.alliances[other.id] += 1;
            other.alliances[this.id] += 1;
          } else {
            // they reject the offer, negotiations fall apart, they battle.
            document.write( `<p>${other.name} says:<br />
"I will do no such thing for the likes of you!"</p>` );
            this.alliances[other.id] -= 1;
            other.alliances[this.id] -= 1;
            this.battle(other);
          }
        }
      }
    }
  }

  consider_offer(other_id,ally_id) {
    var ally_relationship = this.alliance_by_id(ally_id),
        enemy_relationship = this.alliance_by_id(other_id);
    if(ally_relationship <= enemy_relationship) return true;
    else {
      // nb we would like to improve the alliance between this and the ally
      // but that requires finding the ally's Warrior object
      // and I'm too tired to do that right now.
      return false;
    }
  }
}

var Game = {
  current_round: -1,
  prev_round: 0,
  round_offset: 0,
  extant_warriors: [],
  
  // Time-based selection gives us a new sequence every time we start
  // but save-restore might be a better way of doing this.
  // The advantage of using time is it can synchronize every instance.
  round_duration_ms: 2*60*1000, // 2 minutes
  
  // this needs to be set to a canonical constant for synchronization.
  game_start_time: 0,
  
  current_round_start_time: () => {
    return (current_round * round_duration_ms) + game_start_time;
  },
  
  round_time_remaining: () => {
    return Game.round_duration_ms - (Game.current_round_start_time() - Game.game_start_time);
  },
  
  canonical_round_number: () => {
    return Math.floor((Date.now() - game_start_time)/round_duration_ms);
  },
  
  play_next_round: () => {
    Game.prev_round = Game.current_round;
    Game.current_round = Game.current_round + 1;
    var prev_combatants = Cantor.unpair(Game.prev_round + Game.round_offset),
        current_combatants = Cantor.unpair(Game.current_round + Game.round_offset),
        not_done_yet = true;
        
    while(not_done_yet) {
      // we don't want the same heroes to fight two rounds in a row
      // and we don't want any mirror matches.
      if(  current_combatants.includes(prev_combatants[0])
        || current_combatants.includes(prev_combatants[1])
        || current_combatants[0] == current_combatants[1]  ) {
        if(DEBUG) console.log("malformed round id: " + (Game.current_round + Game.round_offset));
        if(DEBUG) console.log(current_combatants);
        Game.round_offset += 1;
        current_combatants = Cantor.unpair(Game.current_round + Game.round_offset);
      } else {
        if(DEBUG) console.log("found valid round id: " + (Game.current_round + Game.round_offset));
        if(DEBUG) console.log(current_combatants);
        not_done_yet = false;
      }
    }
    
    var left = current_combatants[0]%total_warrior_count,
        right = current_combatants[1]%total_warrior_count;
    
    if(!Game.extant_warriors[left]) Game.extant_warriors[left] = new Warrior(left);
    if(!Game.extant_warriors[right]) Game.extant_warriors[right] = new Warrior(right);
    
    left = Game.extant_warriors[left];
    right = Game.extant_warriors[right];
    
    left.current_opponent = right;
    right.current_opponent = left;
    
    // only display one match at a time
    document.body.innerHTML = "";
    
    // introduce the warriors
    document.write("<p>In the red corner:</p> " + left.description);
    document.write("<p>In the blue corner:</p> " + right.description);
    
    // air their grievances, if any
    
    if(left.grievance_count > 0) document.write(left.litany);
    if(right.grievance_count > 0) document.write(right.litany);
    
    // if they don't *completely* hate each other, try to negotiate
    
    if(left.does_not_hate(right)) {
      // nb define this
      left.make_peace_offering(right);
    }
    
    // otherwise, they battle. Battle strength is the number of positive allies
    // plus the number of grievances the hero with the greater battle strength
    // *appears* to win, but the actual outcome is random based on their
    // relative strengths.
    // Either the stronger delivers a coup de grace,
    // or the weaker pulls out a hail-Mary.
  }
};

Game.play_next_round();
