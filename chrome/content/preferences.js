if (!net) var net = {};
if (!net.froihofer) net.froihofer={};
if (!net.froihofer.xnote) net.froihofer.xnote={};

Components.utils.import("resource://xnote/modules/commons.js");
Components.utils.import("resource://xnote/modules/storage.js");

net.froihofer.xnote.Preferences = function() {
  var pub = function(){};

  pub.selectStoragePath = function() {
    var fp = Components.classes["@mozilla.org/filepicker;1"]
                   .createInstance(Components.interfaces.nsIFilePicker);
    //FIXME: Localize "XNote" below
    fp.init(window, "XNote", fp.modeGetFolder);
    var currentDir = net.froihofer.xnote.Storage.getNoteStorageDir();
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
      var prefPath = document.getElementById("pref.storage_path");
      prefPath.value = storagePath;
    }
  }

  return pub;
}();