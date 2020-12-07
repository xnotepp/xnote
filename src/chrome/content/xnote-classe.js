// encoding='UTF-8'

/**
	# File : xnote-classe.xul
	# Author : Hugo Smadja, Lorenz Froihofer
	# Description : classe Note permettant d'instancier des notes.
*/

if (!ExtensionParent) var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
if (!xnoteExtension) var xnoteExtension = ExtensionParent.GlobalManager.getExtension("xnote@froihofer.net");
var {xnote} = ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/xnote.jsm"));
if (!xnote.ns) xnote.ns={};
ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/commons.jsm"), xnote.ns);
ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/storage.jsm"), xnote.ns);

/**
 * Constructor for the class Note using a file descriptor during creation of
 * the note. If the file does not exist, the note is initialized with
 * default values, otherwise it is initialized with the contents of the file.
 */


xnote.WL = {}; 
xnote.ns.Note = function (messageId) {
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

  // Default values for a note window
  pub.DEFAULT_XNOTE_WIDTH = xnote.ns.Commons.xnotePrefs.width;
  pub.DEFAULT_XNOTE_HEIGHT = xnote.ns.Commons.xnotePrefs.height;
  pub.DEFAULT_X_ORIG = (window.outerWidth-pub.DEFAULT_XNOTE_WIDTH)/2;
  pub.DEFAULT_Y_ORIG =(window.outerHeight-pub.DEFAULT_XNOTE_HEIGHT)/2;
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
    fileInStream.init(_notesFile, 0x01, parseInt("0444", 8), null );
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
    fileScriptableIO.read(_notesFile.fileSize-48 ));

    fileScriptableIO.close();
    fileInStream.close();
    pub.text = pub.text.replace(/<BR>/g,'\n');
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

    if (pub.text=='') {
      if (_notesFile.exists()) {
        _notesFile.remove(false);
      }
      return false;
    }
    pub.text = pub.text.replace(/\n/g,'<BR>');
    
    let tempFile = _notesFile.parent.clone();
    tempFile.append("~"+_notesFile.leafName+".tmp");
    // Using 0660 instead of 0600 so that sharing notes accross users
    // within the same group is possible on Linux.
    tempFile.createUnique(tempFile.NORMAL_FILE_TYPE, parseInt("0660",8));

    let fileOutStream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
    with (fileOutStream) {
      init(tempFile, 2, 0x200, false); // Opens for writing only
      write(String(pub.x), 4);
      write(String(pub.y), 4);
      write(String(pub.width), 4);
      write(String(pub.height), 4);
      write(pub.modificationDate, 32);

      // Changed because of this:
      // Just one comment - seems like xnote doesnt allow non-latin characters.
      // I am from Latvia (Letonnie in French I believe) and we have characters
      // like al�ki which are not preserved when saving a note ...
      //
      // fileOutStream.write(pub.text, pub.text.length);
      let contentencode = encodeURIComponent(pub.text);
      write(contentencode, contentencode.length);

      close();
    }
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

  pub.toString = function() {
    return ('\n'+this.x+' ; '+this.y+' ; '+this.width+' ; '+this.height+' ; '+this.text+' ; ')
  }

  pub.exists = function() {
    return _notesFile.exists();
  }

  return pub;
}
