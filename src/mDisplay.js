
//await messenger.runtime.sendMessage({"getXNoteText": ""});
var xnote = "";// k  b\nbbbb\nbbbbbbbbbbbböklllll11111111222222222222222333333333llllcbvvv42vvvvvv";


function notify(message) {
  console.log("received in msgDisplay from background");
  console.log("Msg:", message.XNoteText);

  try {
    let old = document.getElementById("xnote_msgDisplay");
    old.remove();
  }
  catch(e) {};

  function truncate(fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr;
 // acknowledgement to https://gist.github.com/ugurozpinar/10263513   
    separator = separator || '...';
    
    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);
    
    return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
};
let xnote = message.XNoteText;

if (xnote.length>6) {
  let no_linebreak =  xnote.replace(/(\r\n|\n|\r)/gm," ");
  let no_double_space =  no_linebreak.replace(/\s+/g," ");
  let trunc = truncate (no_double_space, 200, "...");

 // https://ourcodeworld.com/articles/read/376/how-to-strip-html-from-a-string-extract-only-text-content-in-javascript
  let strippedHtml = "";
  strippedHtml = trunc.replace(/<[^>]+>/g, ''); //html entities are not converted, <> are stripped
  
  let text3 = "<div id = 'xnote_msgDisplay' style = 'width:100%;background-color: #FBFEBF;' ><b>XNote:  </b>" +strippedHtml + "</div>";
  document.documentElement.firstChild.insertAdjacentHTML("beforebegin",text3);
//var decodedStripedHtml = he.decode(stripedHtml);
     
  /*
    browser.notifications.create({
      "type": "basic",
      "iconUrl": browser.extension.getURL("link.png"),
      "title": "You clicked a link!",
      "message": message.url
    });
    */
  };
  };
  
  browser.runtime.onMessage.addListener(notify);

/*
//messenger.runtime.sendMessage({getXNoteText: "test"}).then(notify)    ;


//from https://www.textfixer.com/tutorials/javascript-line-breaks.php
var no_linebreak =  xnote.replace(/(\r\n|\n|\r)/gm," ");
var no_double_space =  no_linebreak.replace(/\s+/g," ");
//from https://www.textfixer.com/tutorials/javascript-line-breaks.php


var truncate = function (fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr;
 // acknowledgement to https://gist.github.com/ugurozpinar/10263513   
    separator = separator || '...';
    
    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);
    
    return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
};

var stripHtml  = function (dirtyString) {
  const doc = new DOMParser().parseFromString(dirtyString, 'text/html');
  return doc.body.textContent || '';
};

var trunc = truncate (no_double_space, 16, "...");

https://ourcodeworld.com/articles/read/376/how-to-strip-html-from-a-string-extract-only-text-content-in-javascript
var strippedHtml = trunc.replace(/<[^>]+>/g, ''); //html entities are not converted, <> are stripped
//var decodedStripedHtml = he.decode(stripedHtml);
var fff = function () { 
    console.log("mDisplay");
console.log(document);

var  txt = document.createElement("div");
txt.setAttribute("style", "width:100%;background-color: #FBFEBF;");
//txt.textContent =  txt.textContent  + truncate (no_double_space, 16, "...");
txt.innerHTML= "<b>XNote:  </b>   " +strippedHtml;// stripHtml("test");//truncate (no_double_space, 16, "..."));

var text2 = "<div style = 'width:100%;background-color: #FBFEBF;' ><b>XNote:  </b>" +strippedHtml + "</div>";
//document.documentElement.firstChild.insertAdjacentHTML("beforebegin",text2);
//txt.textContent =  txt.textContent  + truncate (no_double_space, 16, "...");
//document.documentElement.insertBefore(txt, document.documentElement.firstChild);

return 1;}();

*/
