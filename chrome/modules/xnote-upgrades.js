if (!xnote) var xnote={};
if (!xnote.ns) xnote.ns={};

let EXPORTED_SYMBOLS = ["Upgrades"];

ChromeUtils.import("resource://xnote/modules/commons.js", xnote.ns);

var Upgrades = function() {
  
  // TODO in future version: This migration functionality should be removed
  // after most of the users updated to at least version 2.2.11 so that preferences
  // under "xnote." will no longer be touched afterwards and the migration
  // to the extension.xnote namespace is completed.
  function migratePrefsToExtensionsNs() {   
    var nsIPrefServiceObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var oldNsIPrefBranchObj = nsIPrefServiceObj.getBranch("xnote.");
    var xnotePrefs = xnote.ns.Commons.xnotePrefs;
    var boolPrefs = ['show_on_select','usetag'];
    var intPrefs = ['width', 'height', 'show_first_x_chars_in_col'];
    var charPrefs = ['dateformat','storage_path'];
    
    boolPrefs.forEach(function(prefName){
      if (oldNsIPrefBranchObj.prefHasUserValue(prefName)) {
        //~ dump ("Migrating preference: '"+prefName+"'\n");
        xnotePrefs.setBoolPref(prefName, oldNsIPrefBranchObj.getBoolPref(prefName));
        oldNsIPrefBranchObj.clearUserPref(prefName);
      }
    });
    
    intPrefs.forEach(function(prefName){
      if (oldNsIPrefBranchObj.prefHasUserValue(prefName)) {
        //~ dump ("Migrating preference: '"+prefName+"'\n");
        xnotePrefs.setIntPref(prefName, oldNsIPrefBranchObj.getIntPref(prefName));
        oldNsIPrefBranchObj.clearUserPref(prefName);
      }
    });
    
    charPrefs.forEach(function(prefName){
      if (oldNsIPrefBranchObj.prefHasUserValue(prefName)) {
        //~ dump ("Migrating preference: '"+prefName+"'\n");
        xnotePrefs.setCharPref(prefName, oldNsIPrefBranchObj.getCharPref(prefName));
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
      xnote.ns.Commons.xnotePrefs.setCharPref('version', 
          xnote.ns.Commons.XNOTE_VERSION);
    }

  };

  return pub;
}();
