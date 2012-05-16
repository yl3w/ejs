// UTILITY FUNCTIONS
var forEach = function(array, action) {
  for(var i = 0; i < array.length; i++) {
    action(array[i]);
  }
};


var reduce = function(combine, base, array) {
  forEach(array, function(elem){
    base = combine(elem, base);
  });
  return base;
};

var map = function(func, array) {
  var result = [];
  forEach(array, function(elem) {
    result.push(func(elem));
  });
  return result;
};


// PARAGRAPH PROCESSING
var splitParagraph = function(txt) {
  var fragments = [];
 
  var processFragment = function(txt, startAt, term, type) {
    var endAt = txt.indexOf(term, startAt + 1);
    fragments.push({
      content : txt.slice(startAt + 1, endAt),
      "type" : type
    });
    return endAt;
  };
  
  var processEmphasis = function(txt, startAt) {
    return processFragment(txt, startAt, "*", "emphasised");
  };
  
  var processFootnote = function(txt, startAt) {
    return processFragment(txt, startAt, "}", "footnote");
  };
  
  var processRegular = function(txt, startAt) {
    var empIndex = txt.indexOf("*", startAt);
    var footIndex = txt.indexOf("{", startAt);
    if(empIndex === -1 && footIndex === -1) {
      fragments.push({
        content : txt.slice(startAt),
        type : "normal"
      });
      return txt.length;
    }
    
    var endAt;
    if(empIndex !== -1 && footIndex !== -1) {
      endAt = Math.min(empIndex, footIndex);
    } else if(empIndex === -1) {
      endAt = footIndex;
    } else {
      endAt = empIndex;
    }
    
    fragments.push({
      content : txt.slice(startAt, endAt),
      type : "normal"
    });
    
    return endAt - 1;
  };
  
  for(var i = 0; i < txt.length; i++) {
    var char = txt.charAt(i);
    if(char === "*") {
      i = processEmphasis(txt, i);
    } else if (char === "{") {
      i = processFootnote(txt, i);
    } else {
      i = processRegular(txt, i);
    }
  }
  return  fragments;
};

var processParagraph = function(paragraph) {
  var countLeadingPercents = function(remainder, count) {
    if(remainder.charAt(0) === '%') {
      return countLeadingPercents(remainder.slice(1), count + 1);
    }
    return count;
  };
  
  var countOfLeadingPercents = countLeadingPercents(paragraph, 0);
  return {
    content : splitParagraph(paragraph.slice(countOfLeadingPercents === 0 ? 
                                             countOfLeadingPercents : countOfLeadingPercents + 1 )),
    type : countOfLeadingPercents === 0 ? "p" : "h" + countOfLeadingPercents
  };
};

var extractFootnotes = function(paragraphs) {
  
  var footnotes = [];
  var currentNote = 0;
  
  var replaceFootnote = function(fragment) {
    if(fragment.type === "footnote") {
      fragment.number = currentNote++;
      footnotes.push(fragment);
      return { type : "reference", number : currentNote };
    } else {
      return fragment;
    }
  };
  
  forEach(paragraphs, function(paragraph){
    paragraph.content = map(replaceFootnote, paragraph.content);
  });
  return footnotes;
};


/// HTML PROCESSING
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

var p = function(paraContent) {
  return tag("p", paraContent);
};

var em = function(content) {
  return tag("em", [content]);
};

var footnote = function(number) {
  return tag("sup", [link("#footnote" + number,
                          String(number))]);
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

var renderParagraph = function(paragraph) {
  
  var renderFragment = function(fragment) {
    if(fragment.type === "normal") {
      return fragment.content;
    } else if (fragment.type === "emphasised") {
      return em(fragment.content);
    } else if (fragment.type === "reference") {
      return footnote(fragment.number);
    }
  };
  
  var tags = map(renderFragment, paragraph.content);
  return tag(paragraph.type, tags);
};

var renderFootnote = function(footnote) {
  var anchor = tag("a", [], {name: "footnote" + footnote.number});
  var number = "[" + (footnote.number + 1) + "] ";
  return tag("p", [tag("small", [anchor, number,
                                 footnote.content])]);
};


var renderFile = function(file, title) {
  var paragraphs = map(processParagraph, file.split("\n\n"));
  var footnotes = map(renderFootnote,
                      extractFootnotes(paragraphs));
  var body = map(renderParagraph, paragraphs).concat(footnotes);
  return renderHTML(htmlDoc(title, body));
};

viewHTML(renderFile(recluseFile(), "The Book of Programming"));

/*

var paragraphs = map(processParagraph, recluseFile().split("\n\n"));
var footnotes = extractFootnotes(paragraphs);

var para = processParagraph("A happy *go* {lucky} person.");

show(splitParagraph("A happy *go* {lucky} person."));

var fn = extractFootnotes([para]);
show(renderParagraph(para));*/
