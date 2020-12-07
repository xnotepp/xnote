let EXPORTED_SYMBOLS = ["Upgrades"];

if (!ExtensionParent) var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
if (!xnoteExtension) var xnoteExtension = ExtensionParent.GlobalManager.getExtension("xnote@froihofer.net");
var {xnote} = ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/xnote.jsm"));
if (!xnote.ns) xnote.ns={};
ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/commons.jsm"), xnote.ns);

var Upgrades = function() {
  
  // TODO in future version: This migration functionality should be removed
  // after most of the users updated to at least version 2.2.11 so that preferences
  // under "xnote." will no longer be touched afterwards and the migration
  // to the extension.xnote namespace is completed.
  function migratePrefsToExtensionsNs() {   
    const nsIPrefServiceObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const oldNsIPrefBranchObj = nsIPrefServiceObj.getBranch("xnote.");
    const xnoteLegacyPrefs = xnote.ns.Commons.xnoteLegacyPrefs;
    const boolPrefs = ['show_on_select','usetag'];
    const intPrefs = ['width', 'height', 'show_first_x_chars_in_col'];
    const charPrefs = ['dateformat','storage_path'];
    
    boolPrefs.forEach(function(prefName){
      if (oldNsIPrefBranchObj.prefHasUserValue(prefName)) {
        //~ dump ("Migrating preference: '"+prefName+"'\n");
        xnoteLegacyPrefs.setBoolPref(prefName, oldNsIPrefBranchObj.getBoolPref(prefName));
        oldNsIPrefBranchObj.clearUserPref(prefName);
      }
    });
    
    intPrefs.forEach(function(prefName){
      if (oldNsIPrefBranchObj.prefHasUserValue(prefName)) {
        //~ dump ("Migrating preference: '"+prefName+"'\n");
        xnoteLegacyPrefs.setIntPref(prefName, oldNsIPrefBranchObj.getIntPref(prefName));
        oldNsIPrefBranchObj.clearUserPref(prefName);
      }
    });
    
    charPrefs.forEach(function(prefName){
      if (oldNsIPrefBranchObj.prefHasUserValue(prefName)) {
        //~ dump ("Migrating preference: '"+prefName+"'\n");
        xnoteLegacyPrefs.setCharPref(prefName, oldNsIPrefBranchObj.getCharPref(prefName));
        oldNsIPrefBranchObj.clearUserPref(prefName);
      }
    });
    oldNsIPrefBranchObj.clearUserPref('version');
  }
  
  var pub = {
    
    checkUpgrades : function (storedVersion, currentVersion) {
      let versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                        .getService(Components.interfaces.nsIVersionComparator);
      if (storedVersion == null || versionComparator.compare(storedVersion, "2.2.11") < 0) {
        migratePrefsToExtensionsNs();
      }
      xnote.ns.Commons.xnoteLegacyPrefs.setCharPref('version', xnote.ns.Commons.XNOTE_VERSION);
    }

  };

  return pub;
}();

//console.debug("Initializing xnote - upgrades.js");