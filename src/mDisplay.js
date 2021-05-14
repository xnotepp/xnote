
var xnote = "";  // k  b\nbbbb\nbbbbbbbbbbbböklllll11111111222222222222222333333333llllcbvvv42vvvvvv";


function notify(message) {
//  console.log("received in msgDisplay from background");
//  console.log("Msg:", message.XNoteText);

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
  
  let text3 = "<div id = 'xnote_msgDisplay' style = 'width:100%;background-color: #FBFEBF;' ><b>XNote  " + message.XNoteDate +": </b>" +strippedHtml + "</div>";
  document.documentElement.firstChild.insertAdjacentHTML("beforebegin",text3);
     
  
  };
  };
  
  browser.runtime.onMessage.addListener(notify);


