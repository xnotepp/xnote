/* eslint-disable object-shorthand */

var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm"),
    { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm"),
    win = Services.wm.getMostRecentWindow("mail:3pane");

// var {xnote} =  ChromeUtils.import("chrome://xnote/content/xnote-window.js");
var {xnote} = ChromeUtils.import("resource://xnote/modules/xnote.js");

console.log("xnote - implementation utilities");
var Utilities = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {    
    
    const PrefTypes = {
      [Services.prefs.PREF_STRING] : "string",
      [Services.prefs.PREF_INT] : "number",
      [Services.prefs.PREF_BOOL] : "boolean",
      [Services.prefs.PREF_INVALID] : "invalid"
    };

    return {
      Utilities: {

        logDebug (text) {
         console.log(text);
        },

        getTBVersion() { 
          return Services.appinfo.version;
        },

        closeNoteWindow() {
          console.log("now close window");
          xnote.ns.Overlay.log("from module");
          let  winNote = Services.wm.getMostRecentWindow("xnote:note");
          if (winNote)  winNote.close();

          
          //xnote.ns.Overlay.log("test");
          //debugger;
          if (winNote)  winNote.close();
          //xnote.ns.Overlay.closeNote();
          //xnote.ns.Window.closeNoteWnd();
        },

        openLinkExternally(url) {
          let uri = url;
          if (!(uri instanceof Ci.nsIURI)) {
            uri = Services.io.newURI(url);
          }
          
          Cc["@mozilla.org/uriloader/external-protocol-service;1"]
            .getService(Ci.nsIExternalProtocolService)
            .loadURI(uri);
        },

        showXhtmlPage(uri) {
          let mail3PaneWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator)
            .getMostRecentWindow("mail:3pane");  
          mail3PaneWindow.openDialog(uri);
        }
  
        // get may only return something, if a value is set
     }
  }
};
}
