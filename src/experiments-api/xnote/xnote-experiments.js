var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm"),
{ Services } = ChromeUtils.import("resource://gre/modules/Services.jsm"),
win = Services.wm.getMostRecentWindow("mail:3pane");;
var {xnote} = ChromeUtils.import("resource://xnote/modules/xnote.js");


//console.log("xnote - experiments API");
var xnoteapi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {    
    return {
      xnoteapi: {
        closeNoteWindow() {
          //console.log("now close window");
          let  winNote = Services.wm.getMostRecentWindow("xnote:note");
          //debugger;
          if (winNote)  winNote.close();
        },

        initNote() {
          xnote.ns.Overlay.initialise('clicBouton');
        }
      }
    }
  };
}
