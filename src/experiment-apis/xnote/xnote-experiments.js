var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm"),
  { TagUtils } = ChromeUtils.import("resource:///modules/TagUtils.jsm"),
  win = Services.wm.getMostRecentWindow("mail:3pane");

var { xnote } = ChromeUtils.import("resource://xnote/modules/xnote.jsm");

const XNOTE_BASE_PREF_NAME = "extensions.xnote.";

/**
 * This maps preference names to their types. This is needed as the prefs
 * system doesn't actually know what format you've stored your pref in.
 */
function prefType(name) {
  switch (name) {
    case XNOTE_BASE_PREF_NAME + "usetag": {
      return "bool";
    }
    case XNOTE_BASE_PREF_NAME + "dateformat": {
      return "string";
    }
    case XNOTE_BASE_PREF_NAME + "width": {
      return "int";
    }
    case XNOTE_BASE_PREF_NAME + "height": {
      return "int";
    }
    case XNOTE_BASE_PREF_NAME + "HorPos": {
      return "int";
    }
    case XNOTE_BASE_PREF_NAME + "VertPos": {
      return "int";
    }
    case XNOTE_BASE_PREF_NAME + "show_on_select": {
      return "bool";
    }
    case XNOTE_BASE_PREF_NAME + "show_in_messageDisplay": {
      return "bool";
    }
    case XNOTE_BASE_PREF_NAME + "show_first_x_chars_in_col": {
      return "int";
    }
    case XNOTE_BASE_PREF_NAME + "storage_path": {
      return "string";
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
        async init() {
          xnote.ns.Commons.init();
          xnote.ns.Storage.updateStoragePath();
          //TODO: Move the stored version to the browser storage or do the check 
          //for a previous installation before preferences are migrated
          let storedVersion = xnote.ns.Commons.xnoteLegacyPrefs.prefHasUserValue("version") ?
            xnote.ns.Commons.xnoteLegacyPrefs.getCharPref("version") : null

          //        console.log(`storedVersion: ${storedVersion}; comparison: `+ (storedVersion == null));
          xnote.ns.Commons.isNewInstallation = storedVersion == null;
          xnote.ns.Upgrades.checkUpgrades(storedVersion, xnote.ns.Commons.XNOTE_VERSION)
          xnote.ns.Commons.xnoteLegacyPrefs.setCharPref("version", xnote.ns.Commons.XNOTE_VERSION);
          xnote.ns.Commons.checkXNoteTag();
        },

        async hasOpenNoteWindow(windowId) {
          let window = context.extension.windowManager.get(windowId).window;
          // There may be a better property to know wether the window still exists, top works.
          return !!(window?.xnoteOverlayObj?.xnoteWindow?.top);
        },

        async openNoteWindow(windowId, messageId, focus) {
          let window = context.extension.windowManager.get(windowId).window;
          let msgHdr = context.extension.messageManager.get(messageId);
          window.xnoteOverlayObj.closeNote();
          window.xnoteOverlayObj.note = new xnote.ns.Note(msgHdr.messageId); // we could pass in the headerMessageId directly
          let note = window.xnoteOverlayObj.note;
          
          // This uses a core function to update the currently selected message, bad, get rid of it
          // and explicitly set the tag on the message. Directly in the background caller using WebExt API.
          window.xnoteOverlayObj.updateTag(note.text);

          let xnotePrefs = xnote.ns.Commons.xnotePrefs;
          if (
            (xnotePrefs.show_on_select && note.text != '') || 
            focus
          ) {
            window.xnoteOverlayObj.xnoteWindow = window.openDialog(
                "chrome://xnote/content/xnote-window.xhtml",
                "XNote",
                `chrome=yes,dependent=yes,resizable=yes,modal=no,left=${window.screenX + note.x},top=${window.screenY + note.y},width=${note.width},height=${note.height}`,
                note,
                focus
              );
              return true;
            }
            return false;
        },

        async closeNoteWindow(windowId) {
          let window = context.extension.windowManager.get(windowId).window;
          let xnoteWindow = window?.xnoteOverlayObj?.xnoteWindow;
          if (xnoteWindow) xnoteWindow.close();
        },



        async getXNote(id) {
          let note = {};
          try {

            let realMessage = context.extension.messageManager.get(id);
            // TODO: The constructor of xnote.ns.Note accepts a window as second
            //       parameter and falls back to the most recent one, if none is
            //       given. This should probably become multi window aware and
            //       the API should pass in a windowId and calculate the actuall
            //       window and specify that explicitly as second parameter here.
            note = new xnote.ns.Note(realMessage.messageId);
            //         console.log("xnote", note);

          } catch (ex) {
            console.error(`Could not get TB mesg`);
          }
          return { text: note.text, date: note.modificationDate };
        },

        async getPref(name) {
          return this.getTbPref(`${XNOTE_BASE_PREF_NAME}${name}`)
        },

        async setPreferences(prefs) {
          xnote.ns.Commons.xnotePrefs = prefs;
          //         console.debug({"XnotePrefs" : xnote.ns.Commons.xnotePrefs});
          xnote.ns.Storage.updateStoragePath();
          xnote.ns.Commons.checkXNoteTag();
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
                return Services.prefs.getStringPref(name);
              }
              case "string": {
                return Services.prefs.getStringPref(name);
              }
              default: {
                console.error(`Unexpected pref type for: ${name}`);
              }
            }
          } catch (ex) {
            console.error(`Could not get TB pref ${name}`, ex);
            return undefined;
          }
        },

        async setTbPref(name, value) {
          try {
            if (name == "mailnews.tags.xnote.color") {
              TagUtils.addTagToAllDocumentSheets("xnote", value);
              Services.prefs.setStringPref(name, value);
            }
            else switch (prefType(name)) {
              case "bool": {
                Services.prefs.setBoolPref(name, value);
                break;
              }
              case "int": {
                Services.prefs.setIntPref(name, value);
                break;
              }
              case "char": {
                Services.prefs.setStringPref(name, value);
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
            console.error(`Could not set TB pref ${name}`, ex);
          }
        }
      }
    }
  }

  onShutdown(isAppShutdown) {
    //    console.debug(`onShutdown: isAppShutdown=${isAppShutdown}`);
    if (isAppShutdown) return;
    
    Components.utils.unload("resource://xnote/modules/dateformat.jsm");
    Components.utils.unload("resource://xnote/modules/commons.jsm");
    Components.utils.unload("resource://xnote/modules/xnote.jsm");

    // invalidate the startup cache, such that after updating the addon the old
    // version is no longer cached
    Services.obs.notifyObservers(null, "startupcache-invalidate");

  }
}
