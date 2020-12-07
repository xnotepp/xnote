
//See https://developer.mozilla.org/en/Using_JavaScript_code_modules for explanation
let EXPORTED_SYMBOLS = ["xnote"];

//This module is needed in order to keep the refs under the xnote namespace
//Otherwise, the references will be missed and the toolbar button will be broken.

if (!xnote) var xnote = {};

