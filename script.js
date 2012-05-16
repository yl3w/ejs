function onload() {
  alert(findSequence(24));
  var gt10 = gt(10);
  alert(gt10(9));
  alert(gt10(11));
}

var findSequence = function(goal) { 
  var dfs = function(curr, history) {
     if(goal === curr) 
        return history;
     
     if (curr > goal)
        return null;
     
     return dfs(curr + 5, "(" + history + " + 5)") ||
        dfs(curr * 3, "(" + history + " * 3)");
  }
  return dfs(1, "1");
};

var gt = function(v) {
  return function(v2) {
    return v2 > v;
  };
};
