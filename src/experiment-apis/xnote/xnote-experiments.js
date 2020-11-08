var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm"),
    { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm"),
    win = Services.wm.getMostRecentWindow("mail:3pane");
var {xnote} = ChromeUtils.import("resource://xnote/modules/xnote.js");

const XNOTE_BASE_PREF_NAME = "extensions.xnote.";

/**
 * This maps preference names to their types. This is needed as the prefs
 * system doesn't actually know what format you've stored your pref in.
 */
function prefType(name) {
  switch (name) {
    case XNOTE_BASE_PREF_NAME+"usetag": {
      return "bool";
    }
    case XNOTE_BASE_PREF_NAME+"dateformat": {
      return "string";
    }
    case XNOTE_BASE_PREF_NAME+"width": {
      return "int";
    }
    case XNOTE_BASE_PREF_NAME+"height": {
      return "int";
    }
    case XNOTE_BASE_PREF_NAME+"HorPos": {
      return "int";
    }
    case XNOTE_BASE_PREF_NAME+"VertPos": {
      return "int";
    }
    case XNOTE_BASE_PREF_NAME+"show_on_select": {
      return "bool";
    }
    case XNOTE_BASE_PREF_NAME+"show_first_x_chars_in_col": {
      return "int";
    }
    case "mailnews.tags.xnote.tag": {
      return "string";
    }
    case "mailnews.tags.xnote.color": {
      return "string";
    }
  }
  throw new Error(`Unexpected pref type ${name}`);
}


//console.log("xnote - experiments API");
var xnoteapi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {    
    return {
      xnoteapi: {
        async closeNoteWindow() {
          //console.log("now close window");
          let  winNote = Services.wm.getMostRecentWindow("xnote:note");
          //debugger;
          if (winNote)  winNote.close();
        },

        async initNote() {
          xnote.ns.Overlay.initialise('clicBouton');
        },

        async getPref(name) {
          return this.getTbPref(`${XNOTE_BASE_PREF_NAME}${name}`)
        },

        async getTbPref(name) {
          try {
            switch (prefType(name)) {
              case "bool": {
                return Services.prefs.getBoolPref(name);
              }
              case "int": {
                return Services.prefs.getIntPref(name);
              }
              case "char": {
                return Services.prefs.getCharPref(name);
              }
              case "string": {
                return Services.prefs.getStringPref(name);
              }
            }
          } catch (ex) {
            console.error(ex);
            return undefined;
          }
          throw new Error("Unexpected pref type");
        },

        async setTbPref(name, value) {
          try {
            switch (prefType(name)) {
              case "bool": {
                Services.prefs.setBoolPref(name, value);
                break;
              }
              case "int": {
                Services.prefs.setIntPref(name, value);
                break;
              }
              case "char": {
                Services.prefs.setCharPref(name, value);
                break;
              }
              case "string": {
                Services.prefs.setStringPref(name, value);
                break;
              }
              default:
                console.error(`Unknown preference type: ${prefType(name)}`)
            }
          } catch (ex) {
            console.error(ex);
          }
        }
      }
    }
  };
}
