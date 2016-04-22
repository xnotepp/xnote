if (!xnote) var xnote={};
if (!xnote.ns) xnote.ns={};

let EXPORTED_SYMBOLS = ["Storage"];

Components.utils.import("resource://xnote/modules/commons.js", xnote.ns);

var Storage = function() {
  /**
   * Path to storage directory of the notes.
   */
  var _storageDir;

  //result
  var pub = {
    updateStoragePath : function() {
      var directoryService = 	Components.classes['@mozilla.org/file/directory_service;1']
                              .getService(Components.interfaces.nsIProperties);
      var profileDir = directoryService.get('ProfD', Components.interfaces.nsIFile);
      var defaultDir = profileDir.clone()
      var xnotePrefs = xnote.ns.Commons.xnotePrefs;
      defaultDir.append('XNote');
      if (!xnotePrefs.prefHasUserValue("storage_path")) {
        _storageDir = defaultDir;
      }
      else try {
        var storagePath = xnote.ns.UTF8Coder.decode(xnotePrefs.getCharPref('storage_path').trim());
        if (storagePath != "") {
          if (storagePath.indexOf("[ProfD]") == 0) {
            _storageDir = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
            _storageDir.initWithPath(profileDir.path);
            _storageDir.appendRelativePath(storagePath.substring(7));
          }
          else {
            _storageDir = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
            _storageDir.initWithPath(storagePath);
          }
        }
        else {
          _storageDir = defaultDir;
        }
      }
      catch (e) {
        ~ dump("\nCould not get storage path:"+e+"\n"+e.stack+"\n...applying default storage path.");
        _storageDir = defaultDir;
      }
//      ~ dump("\nxnote: storageDir initialized to: "+_storageDir.path);
    },

    /**
     * Returns the directory that stores the notes.
     */
    get noteStorageDir() {
      return _storageDir;
    }
  }

  /**
   * Returns a handle to the notes file for the provided message ID. Note
   * that a physical file might not exist on the file system, if the message
   * has no note.
   */
  pub.getNotesFile = function (messageId) {
    //~ dump('\n'+pub.getNoteStorageDir().path+'\n'+messageID);
    var notesFile = _storageDir.clone();
    notesFile.append(escape(messageId).replace(/\//g,"%2F")+'.xnote');
    return notesFile;
    //~ dump('\n'+pub.getNoteStorageDir()+messageID+'.xnote');
  }

  return pub;
}();
