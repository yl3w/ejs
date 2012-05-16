var weightedDistance = function(pointA, pointB) {
  var heightDifference = heightAt(pointA) - heightAt(pointB);
  var climbFactor = (heighDifference < 0 ? 1 : 2);
  var flatDistance = ((pointA.x === pointB.x || pointA.y === pointB.y) ? 100 : 141);
  return flatDistance + climbFactor * Math.abs(heightDifference);
};

var point = function(x, y) {
  return {x : x, y : y};
};

var addPoints = function(pointA, pointB) {
  return {x : pointA.x + pointB.x, y : pointA.y + pointB.y};
};


var samePoints = function(pointA, pointB) {
  return pointA.x === pointB.x && pointA.y === pointB.y;
};


var possibleDirections = function(pt) {
  var dimensions = {width :20, height : 20};
  
  var inGridPredicate = function(point) {
    return (point.x > -1 && point.x < dimensions.width
          && point.y > -1 && point.y < dimensions.height);
  };

  var directions = [point(-1, -1), point(-1, 0), point(-1, 1),
                    point(0, -1),  point(0, 1),
                    point(1, -1), point(1, 0), point(1, 1)];

  return filter(inGridPredicate, map(partial(addPoints, pt), directions));
};

var estimatedDistance = function(pointA, pointB) {
   var dx = Math.abs(pointA.x - pointB.x);
   var dy = Math.abs(pointA.y - pointB.y);

   if (dx > dy)
    return (dx - dy) * 100 + dy * 141;
  else
    return (dy - dx) * 100 + dx * 141;
};

var makeReachedList = function() {
  return {};
};

var storeReached = function (list, point, route) {
  var inner = list[point.x];
  if (inner == undefined) {
    inner = {};
    list[point.x] = inner;
  }
  inner[point.y] = route;
};

var findReached = function(list, point) {
  var inner = list[point.x];
  if (inner == undefined)
    return undefined;
  else
    return inner[point.y];
};

