function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.add = function(point) {
  return new Point(this.x + point.x, this.y + point.y);
};

Point.prototype.isEqualTo = function(point) {
  return this.x === point.x && this.y === point.y;
};

function Grid(width, height) {
  this.width = width;
  this.height = height;
  this.grid = [];
  for(var i = 0; i < width; i++) {
    this.grid[i] = [];
    for(var j = 0; j < height; j++) {
      this.grid[i][j] = undefined;
    }
  }
};

Grid.prototype.valueAt = function(point) {
  return this.grid[point.x][point.y];
};

Grid.prototype.setValueAt = function(point, value) {
  this.grid[point.x][point.y] = value;
};

Grid.prototype.isInside = function(point) {
  return this.width > point.x && this.height > point.y
      && point.x >= 0 && point.y >= 0;
};

Grid.prototype.moveValue = function(from, to) {
  this.setValueAt(to, this.valueAt(from));
  this.setValueAt(from, undefined);
};

Grid.prototype.each = function(action) {
  for(var i = 0; i < this.width; i++) {
    for(var j = 0; j < this.height; j++) {
      var p = new Point(i, j);
      action(p, this.valueAt(p));
    }
  }
};

function Dictionary(values) {
  this.values = values || {};
}

Dictionary.prototype.store = function(name, value) {
  this.values[name] = value;
};
Dictionary.prototype.lookup = function(name) {
  return this.values[name];
};
Dictionary.prototype.contains = function(name) {
  return Object.prototype.hasOwnProperty.call(this.values, name) &&
    Object.prototype.propertyIsEnumerable.call(this.values, name);
};
Dictionary.prototype.each = function(action) {
  for(var property in this.values) {
    if(Dictionary.prototype.contains.call(this, property))
      action(property, this.lookup(property));
  }
};
Dictionary.prototype.names = function() {
  var names = [];
  this.each(function(property, value) {
    names.push(property);
  });
  return names;
};

var directions = new Dictionary(
  {"n":  new Point(-1, 0),
   "ne": new Point(-1, 1),
   "e":  new Point(0,  1),
   "se": new Point(1, 1),
   "s":  new Point(1, 0),
   "sw": new Point(1, -1),
   "w":  new Point(0, -1),
   "nw": new Point(-1, -1)});

function StupidBug() {}
StupidBug.prototype.character = "o";
StupidBug.prototype.act = function() {
  return { type: "move", direction:"s" };
};

function BouncingBug() {
  this.direction = "ne";
}
BouncingBug.prototype.character = "%";
BouncingBug.prototype.act = function(surroundings) {
  if (surroundings[this.direction] != " ")
    this.direction = (this.direction == "ne" ? "sw" : "ne");
  return {type: "move", direction: this.direction};
};

function DrunkBug() {
}
DrunkBug.prototype.character = "~";
DrunkBug.prototype.act = function(surroundings) {
  var randomDirection = function(directions) {
    return directions[Math.floor(Math.random()*directions.length)];
  };
  return {type: "move", direction : randomDirection(directions.names())};
};

var wall = {
  character : "#"
};

function Terrarium(plan) {  
  var grid = new Grid(plan.length, plan[0].length);
  for(var i = 0; i < plan.length; i++) {
    var line = plan[i];
    for(var j = 0; j < line.length; j++) {
      grid.setValueAt(new Point(i, j), elementFromCharacter(line.charAt(j)));
    }
  }
  this.grid = grid;  
};

Terrarium.prototype.toString = function() {
   var characters = [];
   var previousPoint = undefined;
   this.grid.each(function(point, value) {
     previousPoint = previousPoint || point;
     if(previousPoint.x !== point.x)
        characters.push("\n");
     characters.push(characterFromElement(value));
     previousPoint = point;
   });
   characters.push("\n");
   return characters.join("");
};

Terrarium.prototype.listActingCreatures = function() {
  var found = [];
  this.grid.each(function(point, value) {
    if(value !== undefined && value.act)
       found.push({point:point, object:value});
  });
  return found;
};

Terrarium.prototype.listSurroundings = function(point) {
  var surrounding = {};
  var grid = this.grid;
  directions.each(function(direction, ptAdjustment) {
    var np =  point.add(ptAdjustment);
    surrounding[direction] = "#";
    if(grid.isInside(np)) {
      surrounding[direction] = characterFromElement(grid.valueAt(point.add(ptAdjustment))); 
    }
  });
  return surrounding;
};

Terrarium.prototype.processCreature = function(creature) {
  var surrounding = this.listSurroundings(creature.point);
  var action = creature.object.act(surrounding);
  if(action.type === "move" && directions.contains(action.direction)) {
     if(elementFromCharacter(surrounding[action.direction]) === undefined) {
       var to = creature.point.add(directions.lookup(action.direction));
       if(this.grid.isInside(to))
         this.grid.moveValue(creature.point, to);
     }
  } else {
    throw new Error("Unsupported action : " + action.type);
  }
};

Terrarium.prototype.step = function() {
  forEach(this.listActingCreatures(), 
     bind(this.processCreature, this));
  if(this.onStep)
    this.onStep();
};

Terrarium.prototype.start = function() {
  if(!this.running)
    this.running = setInterval(bind(this.step, this), 500);
};

Terrarium.prototype.stop = function() {
  if(this.running)
    clearInterval(this.running);
  this.running = undefined;
};

/* UTILITY FUNCTIONS - GLOBAL OBJECTS */
var creatureTypes = new Dictionary();
creatureTypes.register = function(constructor) {
  this.store(constructor.prototype.character, constructor);
};
creatureTypes.register(StupidBug);
creatureTypes.register(BouncingBug);
creatureTypes.register(DrunkBug);

var forEach = function(array, action) {
  for(var i = 0; i < array.length; i++) {
    action(array[i]);
  }
};

function bind(func, object) {
  return function(){
    return func.apply(object, arguments);
  };
}

function elementFromCharacter(char) {
  if(char===" ") 
    return undefined;
  else if (char === "#")
    return wall;
  else if (creatureTypes.contains(char)) {
    return new (creatureTypes.lookup(char))();
  }
  throw new Error("Unsupported creature : '" + char + "'"); 
};


function characterFromElement(element) {
  if(element === undefined)
    return " ";
  return element.character;
};

var thePlan =
  ["############################",
   "#      #    #      o      ##",
   "#                          #",
   "#          #####           #",
   "##         #   #    ##     #",
   "###           ##     #     #",
   "#           ###      #  %  #",
   "#   ####                   #",
   "#   ##       o     ~       #",
   "# o  #         o       ### #",
   "#    #                     #",
   "############################"];

/*var tr = new Terrarium(thePlan);
tr.onStep = partial(inPlacePrinter(), tr);
tr.onStep();
tr.start();
*/
var newPlan =
  ["############################",
   "#                      #####",
   "#    ##                 ####",
   "#   ####     ~ ~          ##",
   "#    ##       ~            #",
   "#                          #",
   "#                ###       #",
   "#               #####      #",
   "#                ###       #",
   "# %        ###        %    #",
   "#        #######           #",
   "############################"];

var terrarium = new Terrarium(newPlan);
terrarium.onStep = partial(inPlacePrinter(), terrarium);
terrarium.start();
