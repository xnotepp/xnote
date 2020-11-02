var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm"),
{ Services } = ChromeUtils.import("resource://gre/modules/Services.jsm"),
win = Services.wm.getMostRecentWindow("mail:3pane");;
var {xnote} = ChromeUtils.import("resource://xnote/modules/xnote.js");


console.log("xnote - experiments API");
var xnoteapi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {    
    const PrefTypes = {
      [Services.prefs.PREF_STRING] : "string",
      [Services.prefs.PREF_INT] : "number",
      [Services.prefs.PREF_BOOL] : "boolean",
      [Services.prefs.PREF_INVALID] : "invalid"
    };
    
    return {
      xnoteapi: {
        closeNoteWindow() {
          console.log("now close window");
          xnote.ns.Overlay.log("from module");
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
