if (!net) var net = {};
if (!net.froihofer) net.froihofer={};
if (!net.froihofer.xnote) net.froihofer.xnote={};

var EXPORTED_SYMBOLS = ["net"];

Components.utils.import("resource://xnote/modules/commons.js");

net.froihofer.xnote.Storage = function() {
  //result
  var pub = function() {};

  /**
   * Path to storage directory of the notes.
   */
  var storageDir;


  pub.updateStoragePath = function() {
    var directoryService = 	Components.classes['@mozilla.org/file/directory_service;1']
                            .getService(Components.interfaces.nsIProperties);
    var profileDir = directoryService.get('ProfD', Components.interfaces.nsIFile);
    var defaultDir = profileDir.clone()
    defaultDir.append('XNote');
    try {
      var storagePath = net.froihofer.xnote.Commons.getXNotePrefs().getCharPref('storage_path').trim();
      if (storagePath != "") {
        if (storagePath.indexOf("[ProfD]") == 0) {
          storageDir = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
          storageDir.initWithPath(profileDir.path);
          storageDir.appendRelativePath(storagePath.substring(7));
        }
        else {
          storageDir = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
          storageDir.initWithPath(storagePath);
        }
      }
      else {
        storageDir = defaultDir;
      }
    }
    catch (e) {
//      ~dump("\nCould not get storage path:"+e+"\n"+e.stack+"\n...applying default storage path.");
      net.froihofer.xnote.Commons.getXNotePrefs().clearUserPref("storage_path");
      storageDir = defaultDir;
    }
//    ~ dump("\nxnote: storageDir initialized to: "+storageDir.path);
  }

  /**
   * Returns the directory that stores the notes.
   */
  pub.getNoteStorageDir = function() {
    return storageDir;
  }

  /**
   * Returns a handle to the notes file for the provided message ID. Note
   * that a physical file might not exist on the file system, if the message
   * has no note.
   */
  pub.getNotesFile = function (messageId) {
    //~ dump('\n'+pub.getNoteStorageDir().path+'\n'+messageID);
    var notesFile = storageDir.clone();
    notesFile.append(escape(messageId).replace(/\//g,"%2F")+'.xnote');
    return notesFile;
    //~ dump('\n'+pub.getNoteStorageDir()+messageID+'.xnote');
  }

  return pub;
}();
