
//See https://developer.mozilla.org/en/Using_JavaScript_code_modules for explanation
let EXPORTED_SYMBOLS = ["xnote"];

var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
if (!xnote) var xnote = {};

xnote.mainTBWin = Services.wm.getMostRecentWindow("mail:3pane");


