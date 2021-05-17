
var xnote = "";  // k  b\nbbbb\nbbbbbbbbbbbböklllll11111111222222222222222333333333llllcbvvv42vvvvvv";
var xnoteOrig = "";
var dateOrig = "";
var btnState = 0;//debugger;
//console.log("loading mdisplay script");

function notify(message) {
  //  console.log("received in msgDisplay from background");
  //  console.log("Msg:", message.XNoteText);
  //debugger;
  try {
    let old = document.getElementById("xnote_msgDisplay");
    old.remove();
  }
  catch (e) { };

  function truncate(fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr;
    // acknowledgement to https://gist.github.com/ugurozpinar/10263513   
    separator = separator || '...';

    var sepLen = separator.length,
      charsToShow = strLen - sepLen,
      frontChars = Math.ceil(charsToShow / 2),
      backChars = Math.floor(charsToShow / 2);

    return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
  };
  xnoteOrig = xnote = message.text;
  dateOrig = message.date;

  if (xnote.length > 0) {
    let no_linebreak = xnote.replace(/(\r\n|\n|\r)/gm, " ");
    let no_double_space = no_linebreak.replace(/\s+/g, " ");
    let trunc = truncate(no_double_space, 350, "...");
    let imgMax = document.createElement("img");
    imgMax.src = messenger.runtime.getURL("icons/iconfinder_maximize-2_2561250MIT16.png");
    // https://ourcodeworld.com/articles/read/376/how-to-strip-html-from-a-string-extract-only-text-content-in-javascript
    let strippedHtml = "";
    strippedHtml = trunc.replace(/<[^>]+>/g, ''); //html entities are not converted, <> are stripped
    //document.documentElement.firstChild.appendChild(img);
    let text3 = "<div id = 'xnote_msgDisplay' style = 'width:100%;background-color: #FBFEBF;' >" +
      "<button id = 'chgSize'><img id = 'aa'  height = '12' src = '" + imgMax.src + "' /></button><b>XNote  " + message.date + ": </b><span id = 'xnoteFull'></span><span id = 'xnoteShort'>" + strippedHtml + "</span></div>";
    document.documentElement.firstChild.insertAdjacentHTML("beforebegin", text3);
    let btn = document.getElementById("chgSize");
    btn.addEventListener("click", showAll, false);


  };
};
function handleResponse(message) {
  //console.log(`note Message from the background script: `, message);
}

function showAll() {
  //console.log("all", xnoteOrig);
  let img = document.getElementById("aa");
  img.src = messenger.runtime.getURL("icons/iconfinder_minimize-2_2561246MIT16.png");
  //  btn.textContent = "Compact";
  if (btnState == 0) {
    let note = document.getElementById("xnoteShort");
    note.textContent = "";//remove();
    let div = document.createElement("div");
    div.setAttribute("id", "fullNoteDiv");
    note.append(div);

    let span = document.getElementById("xnoteFull");
    // let fullnote = "<div id = 'fullNote'>" + xnote + "</div>";
    //span.insertAdjacentHTML("afterend",fullnote);
    let brNote = xnoteOrig.replace(/(?:\r\n|\r|\n)/g, '<br />');//xnoteOrig.replace("\r", "<br>");
    div.insertAdjacentHTML("afterend", brNote);
    btnState = 1;
  }
  else {
    btnState = 0;
    this.value = "Show all";
    let all = document.getElementById("xnote_msgDisplay");
    all.remove();
    notify({ text: xnoteOrig, date: dateOrig });

  }
};

async function startup() {
  await messenger.runtime.onMessage.addListener(notify);
  let message = await messenger.runtime.sendMessage({ command: "getXNote" });
  //console.log(message);//  sending.then(handleResponse);//

  notify(message);

}

startup();


