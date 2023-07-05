//See https://developer.mozilla.org/en/Using_JavaScript_code_modules for explanation
var EXPORTED_SYMBOLS = ["xnote"];
var Services = globalThis.Services || ChromeUtils.import(
  "resource://gre/modules/Services.jsm"
).Services;

var xnote = {
  ns: {}
};

xnote.ns.Commons = ChromeUtils.import("resource://xnote/modules/commons.jsm").Commons;

xnote.ns.DateFormat = ChromeUtils.import("resource://xnote/modules/dateformat.jsm").DateFormat;

xnote.ns.Storage = function () {
  /**
   * Path to storage directory of the notes.
   */
  var _storageDir;

  //result
  var pub = {
    updateStoragePath: function () {
      let directoryService = Components.classes['@mozilla.org/file/directory_service;1']
        .getService(Components.interfaces.nsIProperties);
      let profileDir = directoryService.get('ProfD', Components.interfaces.nsIFile);
      let defaultDir = profileDir.clone();
      let xnotePrefs = xnote.ns.Commons.xnotePrefs;
      defaultDir.append('XNote');
      if (!xnotePrefs || !xnotePrefs.storage_path) {
        _storageDir = defaultDir;
      }
      else try {
        let storagePath = xnotePrefs.storage_path;
        let FileUtils = ChromeUtils.import("resource://gre/modules/FileUtils.jsm").FileUtils;
        if (storagePath != "") {
          if (storagePath.indexOf("[ProfD]") == 0) {
            _storageDir = new FileUtils.File(profileDir.path);
            _storageDir.appendRelativePath(storagePath.substring(7));
          }
          else {
            _storageDir = new FileUtils.File(storagePath);
          }
        }
        else {
          _storageDir = defaultDir;
        }
      }
      catch (e) {
        console.error("Could not get storage path:" + e + "\n" + "\n...applying default storage path." + e.stack);
        _storageDir = defaultDir;
      }
      //     console.debug("xnote: storageDir initialized to: "+_storageDir.path);
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
    let notesFile = _storageDir.clone();
    notesFile.append(escape(messageId).replace(/\//g, "%2F") + '.xnote');
    return notesFile;
    //~ dump('\n'+pub.getNoteStorageDir()+messageID+'.xnote');
  }

  return pub;
}();

xnote.ns.Upgrades = function () {
  // TODO in future version: This migration functionality should be removed
  // after most of the users updated to at least version 2.2.11 so that preferences
  // under "xnote." will no longer be touched afterwards and the migration
  // to the extension.xnote namespace is completed.
  function migratePrefsToExtensionsNs() {
    const nsIPrefServiceObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const oldNsIPrefBranchObj = nsIPrefServiceObj.getBranch("xnote.");
    const xnoteLegacyPrefs = xnote.ns.Commons.xnoteLegacyPrefs;
    const boolPrefs = ['show_on_select', 'usetag'];
    const intPrefs = ['width', 'height', 'show_first_x_chars_in_col'];
    const charPrefs = ['dateformat', 'storage_path'];

    boolPrefs.forEach(function (prefName) {
      if (oldNsIPrefBranchObj.prefHasUserValue(prefName)) {
        //~ dump ("Migrating preference: '"+prefName+"'\n");
        xnoteLegacyPrefs.setBoolPref(prefName, oldNsIPrefBranchObj.getBoolPref(prefName));
        oldNsIPrefBranchObj.clearUserPref(prefName);
      }
    });

    intPrefs.forEach(function (prefName) {
      if (oldNsIPrefBranchObj.prefHasUserValue(prefName)) {
        //~ dump ("Migrating preference: '"+prefName+"'\n");
        xnoteLegacyPrefs.setIntPref(prefName, oldNsIPrefBranchObj.getIntPref(prefName));
        oldNsIPrefBranchObj.clearUserPref(prefName);
      }
    });

    charPrefs.forEach(function (prefName) {
      if (oldNsIPrefBranchObj.prefHasUserValue(prefName)) {
        //~ dump ("Migrating preference: '"+prefName+"'\n");
        xnoteLegacyPrefs.setCharPref(prefName, oldNsIPrefBranchObj.getCharPref(prefName));
        oldNsIPrefBranchObj.clearUserPref(prefName);
      }
    });
    oldNsIPrefBranchObj.clearUserPref('version');
  }

  var pub = {

    checkUpgrades: function (storedVersion, currentVersion) {
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

xnote.ns.Note = function (messageId, window) {
  //~ dump('\n->Note');

  // --- internal variables ------------------------------------------
  var _notesFile = xnote.ns.Storage.getNotesFile(messageId);
  var _modified = false;

  //result
  var pub = {
    //--- properties ----------------------------------------------------
    get modified() {
      return _modified;
    },
    set modified(value) {
      _modified = value;
    }
  }

  // If no window specified, use the most recent
  let win = window || Services.wm.getMostRecentWindow("mail:3pane");

  // Default values for a note window
  pub.DEFAULT_XNOTE_WIDTH = xnote.ns.Commons.xnotePrefs.width;
  pub.DEFAULT_XNOTE_HEIGHT = xnote.ns.Commons.xnotePrefs.height;
  pub.DEFAULT_X_ORIG = (win.outerWidth - pub.DEFAULT_XNOTE_WIDTH) / 2;
  pub.DEFAULT_Y_ORIG = (win.outerHeight - pub.DEFAULT_XNOTE_HEIGHT) / 2;
  pub.DEFAULT_X = xnote.ns.Commons.xnotePrefs.horPos;
  pub.DEFAULT_Y = xnote.ns.Commons.xnotePrefs.vertPos;

  //--- Intialisation (either from file or defaults) --------------------------

  //~ dump('\n<-Note');
  if (!_notesFile || !_notesFile.exists()) {
    pub.x = pub.DEFAULT_X;
    pub.y = pub.DEFAULT_Y;
    pub.width = pub.DEFAULT_XNOTE_WIDTH;
    pub.height = pub.DEFAULT_XNOTE_HEIGHT;
    pub.text = '';
    pub.modificationDate = '';
    //~ dump('\n<-note_charger');
  }
  else {
    var fileInStream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
    var fileScriptableIO = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
    fileInStream.init(_notesFile, 0x01, parseInt("0444", 8), null);
    fileScriptableIO.init(fileInStream);
    pub.x = parseInt(fileScriptableIO.read(4));
    pub.y = parseInt(fileScriptableIO.read(4));
    pub.width = parseInt(fileScriptableIO.read(4));
    pub.height = parseInt(fileScriptableIO.read(4));
    pub.modificationDate = fileScriptableIO.read(32);
    // Changed because of this:
    // Just one comment - seems like xnote doesnt allow non-latin characters.
    // I am from Latvia (Letonnie in French I believe) and we have characters
    // like al�ki which are not preserved when saving a note ...
    //
    // this.text = fileScriptableIO.read(_notesFile.fileSize-16);
    pub.text = decodeURIComponent(
      fileScriptableIO.read(_notesFile.fileSize - 48));

    fileScriptableIO.close();
    fileInStream.close();
    pub.text = pub.text.replace(/<BR>/g, '\n');
    //~ dump('\n<-note_charger');
  }

  //--- METHOD DEFINITIONS -------------------------------------------------

  /**
   * Save the note in a file with the name of the message-id. If the content
   * of an existing note is empty, e.g., text was deleted, the note will be
   * deleted.
   */
  pub.saveNote = function () {
    //~ dump('\n->saveNote');

    if (pub.text == '') {
      if (_notesFile.exists()) {
        _notesFile.remove(false);
      }
      return false;
    }
    pub.text = pub.text.replace(/\n/g, '<BR>');

    let tempFile = _notesFile.parent.clone();
    tempFile.append("~" + _notesFile.leafName + ".tmp");
    // Using 0660 instead of 0600 so that sharing notes accross users
    // within the same group is possible on Linux.
    tempFile.createUnique(tempFile.NORMAL_FILE_TYPE, parseInt("0660", 8));

    let fileOutStream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
    fileOutStream.init(tempFile, 2, 0x200, false); // Opens for writing only
    fileOutStream.write(String(pub.x), 4);
    fileOutStream.write(String(pub.y), 4);
    fileOutStream.write(String(pub.width), 4);
    fileOutStream.write(String(pub.height), 4);
    fileOutStream.write(pub.modificationDate, 32);

    // Changed because of this:
    // Just one comment - seems like xnote doesnt allow non-latin characters.
    // I am from Latvia (Letonnie in French I believe) and we have characters
    // like al�ki which are not preserved when saving a note ...
    //
    // fileOutStream.write(pub.text, pub.text.length);
    let contentencode = encodeURIComponent(pub.text);
    fileOutStream.write(contentencode, contentencode.length);

    fileOutStream.close();
    tempFile.moveTo(null, _notesFile.leafName);
    pub.modified = false;
    //~ dump('\n<-saveNote');
    return true;
  }

  /**
   * Deletes the note on the disk drive.
   */
  pub.deleteNote = function () {
    //~ dump('\n->note_supprimer');
    if (_notesFile.exists()) {
      _notesFile.remove(false);
      //~ dump('\n->note_supprimer');
      return true;
    }
    else {
      //~ dump('\n->note_supprimer');
      return false;
    }
  }

  pub.toString = function () {
    return ('\n' + this.x + ' ; ' + this.y + ' ; ' + this.width + ' ; ' + this.height + ' ; ' + this.text + ' ; ')
  }

  pub.exists = function () {
    return _notesFile.exists();
  }

  return pub;
}
