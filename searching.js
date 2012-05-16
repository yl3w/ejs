// UTILITY FUNCTIONS

var Break = {toString:function() { return "Break"; }};

var forEach = function(array, func){

  try {
    for(var i = 0; i < array.length; i++) {
      func(array[i]);
    }
  } catch (exception) {
    if(exception !== Break)
      throw exception;
  }
};

var any = function(predicate, array) {
  for(var i = 0; i < array.length; i++) {
    var condition = predicate(array[i]);
    if(condition === true)
      return condition;
  }
  return false;
};

var every = function(predicate, array) {
  for(var i = 0; i < array.length; i++) {
    var condition = predicate(array[i]);
    if(condition === false)
      return condition;
  }
  
  return true;
};

var member = function(array, value) {
  return any(partial(op["==="], value), array);
};

var flatten = function(arrays) {
  var result = [];
  forEach(arrays, function(array) {
    forEach(array, function(elem) {
      result.push(elem);
    });
  });
  return result;
};

var filter = function(predicate, array) {
  var result = [];
  forEach(array, function(elem) {
    if(predicate(elem) === true) {
      result.push(elem);
    }
  });
  return result;
};

// GRAPH SET UP
var roads = {};
 
var makeRoad = function(from, to, length) {
  var addRoad = function(from, to){
    if(!(from in roads)){
      roads[from] =  [];
    }
    roads[from].push({to:to, distance:length});
  };
  
  addRoad(from, to);
  addRoad(to, from);
};
 
var makeRoads = function(from) {
  for(var i = 1; i < arguments.length; i+=2) {
    makeRoad(from, arguments[i], arguments[i+1]);
  }
};
 
var roadsFrom = function(place) {
  if(!(place in roads))
    throw new Error("No place names " + place + " found.");
  return roads[place];
};
 
makeRoads("Point Kiukiu", "Hanaiapa", 19,
          "Mt Feani", 15, "Taaoa", 15);
makeRoads("Airport", "Hanaiapa", 6, "Mt Feani", 5,
          "Atuona", 4, "Mt Ootua", 11);
makeRoads("Mt Temetiu", "Mt Feani", 8, "Taaoa", 4);
makeRoads("Atuona", "Taaoa", 3, "Hanakee pearl lodge", 1);
makeRoads("Cemetery", "Hanakee pearl lodge", 6, "Mt Ootua", 5);
makeRoads("Hanapaoa", "Mt Ootua", 3);
makeRoads("Puamua", "Mt Ootua", 13, "Point Teohotepapapa", 14);
 
var gamblerPath = function(from, to) {
  
  var randomInteger = function(below) {
    return Math.floor(Math.random() * below);
  };
  
  var randomDirection = function(from) {
    var options = roadsFrom(from);
    return options[randomInteger(options.length)].to;
  };
  
  var path = [];
  while(from !== to) {
    path.push(from);
    //pick a random path
    from = randomDirection(from);
  }
  path.push(to);
  return path;
};

var possibleRoutes = function(from, to) {
  var findRoutes = function(route) {
    
    var notVisited = function(road) {
      return !member(route.places, road.to);
    };
    
    var continueRoute = function(road) {
      return findRoutes({places : route.places.concat([road.to]),
                         length : route.length + road.distance});
    };
    
    var end = route.places[route.places.length - 1];
    if(end === to)
      return [route];
    else
      return flatten(map(continueRoute, filter(notVisited, roadsFrom(end))));
  };
  
  return findRoutes({places : [from], length : 0});
};

var shortestRoute = function(from, to) {
  var routes = possibleRoutes(from, to);
  var result = null;
  forEach(routes, function(route) {
    if(result === null || result.length > route.length)
      result = route;
  });
  return result;
};

var possibleRoutes = function(from, to) {
  
  var findRoutes = function(route) {
    var notVisited = function(road) {
        return !member(route.places, road.to);
    };

    var continueRoute = function(road) {
      return findRoutes({ places : route.places.concat([road.to]),
                          length : route.length + road.distance});
    };

    var current = route[route.places.length - 1];
    if(current === to)
      return route;
    else
      map(filter(notVisited, roadsFrom(end)), continueRoute);
  };
};
 
//show(gamblerPath("Hanaiapa", "Mt Feani"));

//show(member(["Fear", "Loathing"], "Denial"));
//show(every(partial(op["!="], 10), [1, 2, 3, 4, 5, 6]));
//show(flatten([[1, 2], [3, 4], [5, 6]]));
//show(filter(partial(op["<"], 2), [1, 2, 3, 2, 4, 2, 5]));
show(possibleRoutes("Point Teohotepapapa", "Point Kiukiu"));
show(possibleRoutes("Hanapaoa", "Mt Ootua"));
show(shortestRoute("Point Teohotepapapa", "Point Kiukiu").places);
