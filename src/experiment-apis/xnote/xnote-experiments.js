var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm"),
    { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm"),
    { TagUtils } = ChromeUtils.import("resource:///modules/TagUtils.jsm"),
    win = Services.wm.getMostRecentWindow("mail:3pane");

const { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
const xnoteExtension = ExtensionParent.GlobalManager.getExtension("xnote@froihofer.net");
var {xnote} = ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/xnote.jsm"));
if (!xnote.ns) xnote.ns = {};
ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/commons.jsm"), xnote.ns);
ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/storage.jsm"), xnote.ns);
ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/xnote-upgrades.jsm"), xnote.ns);

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
    case XNOTE_BASE_PREF_NAME+"storage_path": {
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
              
          console.log(`storedVersion: ${storedVersion}; comparison: `+ (storedVersion == null));
          xnote.ns.Commons.isNewInstallation = storedVersion == null;
          xnote.ns.Upgrades.checkUpgrades(storedVersion, xnote.ns.Commons.XNOTE_VERSION)
          xnote.ns.Commons.xnoteLegacyPrefs.setCharPref("version", xnote.ns.Commons.XNOTE_VERSION);
          xnote.ns.Commons.checkXNoteTag();
        },
        
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

        async setPreferences(prefs) {
          xnote.ns.Commons.xnotePrefs = prefs;
          console.debug({"XnotePrefs" : xnote.ns.Commons.xnotePrefs});
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
                return Services.prefs.getCharPref(name);
              }
              case "string": {
                return Services.prefs.getStringPref(name);
              }
              default: {
                console.error(`Unexpected pref type for: ${name}`);
              }
            }
          } catch (ex) {
            console.error(`Could not get TB pref ${name}` , ex);
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
            console.error(`Could not set TB pref ${name}` , ex);
          }
        }
      }
    }
  }

  onShutdown(isAppShutdown) {
    console.debug(`onShutdown: isAppShutdown=${isAppShutdown}`);
    if (isAppShutdown) return;
  
    Components.utils.unload(extension.rootURI.resolve("chrome/modules/xnote-upgrades.jsm"));
    Components.utils.unload(extension.rootURI.resolve("chrome/modules/storage.jsm"));
    Components.utils.unload(extension.rootURI.resolve("chrome/modules/commons.jsm"));
    Components.utils.unload(extension.rootURI.resolve("chrome/modules/xnote.jsm"));

    // invalidate the startup cache, such that after updating the addon the old
    // version is no longer cached
    Services.obs.notifyObservers(null, "startupcache-invalidate");
    
  }
}
