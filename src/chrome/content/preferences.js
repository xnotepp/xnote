if (!xnote) var xnote = {};
if (!xnote.ns) xnote.ns = {};

ChromeUtils.import("resource://xnote/modules/commons.js", xnote.ns);
ChromeUtils.import("resource://xnote/modules/storage.js", xnote.ns);
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

Preferences.addAll([
    { id: "extensions.xnote.width", type: "int" },
    { id: "extensions.xnote.height", type: "int" },
    { id: "extensions.xnote.storage_path", type: "string" },
    { id: "mailnews.tags.xnote.tag", type: "string" },
    { id: "mailnews.tags.xnote.color", type: "string" },
    { id: "extensions.xnote.usetag", type: "bool" },
    { id: "extensions.xnote.show_on_select", type: "bool" },
    { id: "extensions.xnote.show_first_x_chars_in_col", type: "int" },
]);

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
        let prefPath = document.getElementById("xnote-storage-path");
        prefPath.value = storagePath;
        xnote.ns.Commons.xnotePrefs.setCharPref("storage_path", storagePath);
      });
    }
  };

  return pub;
}();
