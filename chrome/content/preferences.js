if (!xnote) var xnote = {};
if (!xnote.ns) xnote.ns = {};

Components.utils.import("resource://xnote/modules/commons.js", xnote.ns);
Components.utils.import("resource://xnote/modules/storage.js", xnote.ns);
Components.utils.import("resource://xnote/modules/StringBundle.js", xnote.ns);

xnote.ns.Preferences = function() {
  var _stringBundle = new xnote.ns.StringBundle("chrome://xnote/locale/xnote-overlay.properties");

  var pub = {
    selectStoragePath : function() {
      var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
      fp.init(window, _stringBundle.get("Select.storage.dir"), fp.modeGetFolder);
      var currentDir = xnote.ns.Storage.noteStorageDir;
      fp.displayDirectory = currentDir;
      var rv = fp.show();
      if (rv == fp.returnOK) {
        var storagePath =  fp.file.path;
        //Check whether the new path is inside the profile directory
        //and if yes, make the path relative to the profile.
        var directoryService = 	Components.classes['@mozilla.org/file/directory_service;1']
                          .getService(Components.interfaces.nsIProperties);
        var profileDir = directoryService.get('ProfD', Components.interfaces.nsILocalFile);
        if (storagePath.indexOf(profileDir.path) == 0) {
          if (storagePath.length == profileDir.path.length) {
            storagePath = "[ProfD]"
          }
          else {
            storagePath = "[ProfD]"+storagePath.substr(profileDir.path.length+1);
          }
        }
        var prefPath = document.getElementById("xnote-pref-storage_path");
        prefPath.value = storagePath;
      }
    }
  };

  return pub;
}();
