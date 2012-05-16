var tag = function(name, content, attributes) {
  return {name : name, attributes : attributes, content : content};
};

var link = function(target, text) {
  return tag("a", [text], {href : target});
};

var htmlDoc = function(title, bodyContent) {
  return tag("html", [tag("head", [tag("title", [title])]),
                      tag("body", bodyContent)]);
};

var img = function(src) {
  return tag("img", [], {src:src});
};

var escapeHTML = function(text) {
  var replacements = [[/&/g, "&amp;"], [/"/g, "&quot;"],
                      [/</g, "&lt;"], [/>/g, "&gt;"]];
  forEach(replacements, function(replace) {
    text = text.replace(replace[0], replace[1]);
  });
  return text;
}

var renderHTML = function(element) {
  var pieces = [];
  var renderAttributes = function(attributes){
    var result = [];
    if(attributes) {
      for(var name in attributes) {
        result.push(" " + name + "=\"" + escapeHTML(attributes[name]) + "\"");
      }
    }
    return result.join("");
  };element
  
  var render = function(element) {
    if(typeof element === "string") {
      pieces.push(escapeHTML(element));
    }
    else if(!element.content || element.content.length === 0) {
      pieces.push("<" + element.name + renderAttributes(element.attributes) + "/>");
    } else {
      pieces.push("<" + element.name + renderAttributes(element.attributes) + ">");
      forEach(element.content, render);
      pieces.push("</" + element.name + ">");
    }
  };
  
  render(element);
  return pieces.join("");
};


