import '/extlib/l10n.js';

var btnSave = document.getElementById("btnSave");
var btnSelectStoragePath = document.getElementById("btnSelectStoragePath");

var prefs;
var defaultPrefs;

function savePrefs() {
  console.log("Save prefs called");
}

function selectStoragePath() {
  console.log("selectStoragePath called");
}

function initOptions() {

	btnSave.addEventListener('click', savePrefs);
	btnSelectStoragePath.addEventListener('click', selectStoragePath);

}

document.addEventListener('DOMContentLoaded', () => {
  initOptions();
}, { once: true });

/*if (!xnote) var xnote = {};
if (!xnote.ns) xnote.ns = {};

ChromeUtils.import("resource://xnote/modules/commons.js", xnote.ns);
ChromeUtils.import("resource://xnote/modules/storage.js", xnote.ns);
ChromeUtils.import("resource://gre/modules/Services.jsm");

xnote.ns.Preferences = function() {
  let _stringBundle = Services.strings.createBundle("chrome://xnote/locale/xnote-overlay.properties");

  var pub = {
    selectStoragePath : function() {
      let fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
      fp.init(window, _stringBundle.GetStringFromName("Select.storage.dir"), fp.modeGetFolder);
      let currentDir = xnote.ns.Storage.noteStorageDir;
      fp.displayDirectory = currentDir;
      fp.open(rv => {
        if (rv != fp.returnOK) {
          return;
        };
        var storagePath =  fp.file.path;
        //Check whether the new path is inside the profile directory
        //and if yes, make the path relative to the profile.
        var directoryService = 	Components.classes['@mozilla.org/file/directory_service;1']
                          .getService(Components.interfaces.nsIProperties);
        let profileDir = directoryService.get('ProfD', Components.interfaces.nsIFile);
        if (storagePath.indexOf(profileDir.path) == 0) {
          if (storagePath.length == profileDir.path.length) {
            storagePath = "[ProfD]"
          }
          else {
            storagePath = "[ProfD]"+storagePath.substr(profileDir.path.length+1);
          }
        }
        let prefPath = document.getElementById("xnote-pref-storage_path");
        prefPath.value = storagePath;
      });
    }
  };

  return pub;
}(); */
