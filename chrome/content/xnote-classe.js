// encoding='UTF-8'

/**
	# Fichier : xnote-classe.xul
	# Auteur : Hugo Smadja, Lorenz Froihofer
	# Description : classe Note permettant d'instancier des notes.
*/

// Default values for a note window
const DEFAULT_XNOTE_WIDTH=250;
const DEFAULT_XNOTE_HEIGHT=200;
const X=(window.screen.width-DEFAULT_XNOTE_WIDTH)/2;
const Y=(window.screen.height-DEFAULT_XNOTE_HEIGHT)/2;


/**
 * Constructor for the class Note using a file descriptor during creation of
 * the note. If the file does not exist, the note is initialized with
 * default values, otherwise it is initialized with the contents of the file.
 */
function Note(file) {
  //~ dump('\n->Note');

  //variables
  this.notesFile = file;
  this.tempFile = null

  //properties
  var modified = false;
  this.isModified = function() {
    return modified;
  }
  this.setModified = function(value) {
    if (value && ! modified) {
      this.createTempFile();
    }
    modified = value;
  }

  //Moved to here from the save method as it otherwise will not work
  //when closing thunderbird immediately after editing a message
  //Probably, we can no longer create an instance at that point in time.
  this.stream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
  //intialisation
  //~ dump('\n<-Note');
  return this.init();
}


/***** METHOD DEFINITIONS **********************************/

/**
 * Here we initialise the note -- either from file or default values.
 */
Note.prototype.init = function () {
  //~ dump('\n->note_charger');
  if (!this.notesFile.exists())
  {
    this.x = X;
    this.y = Y;
    this.width = DEFAULT_XNOTE_WIDTH;
    this.height = DEFAULT_XNOTE_HEIGHT;
    this.text = '';
    this.modDate = '';
    //~ dump('\n<-note_charger');
    return false;
  }
  else
  {
    var stream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
    var fileScriptableIO = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
    stream.init(this.notesFile, 0x01, 0444, null );
    fileScriptableIO.init(stream);
    this.x = fileScriptableIO.read(4);
    this.y = fileScriptableIO.read(4);
    this.width = fileScriptableIO.read(4);
    this.height = fileScriptableIO.read(4);
    this.modDate = fileScriptableIO.read(32);
    // Changed because of this:
    // Just one comment - seems like xnote doesnt allow non-latin characters.
    // I am from Latvia (Letonnie in French I believe) and we have characters
    // like al�ki which are not preserved when saving a note ...
    //
    // this.text = fileScriptableIO.read(this.notesFile.fileSize-16);
    this.text = decodeURIComponent(
      fileScriptableIO.read( this.notesFile.fileSize-48 ));

    fileScriptableIO.close();
    stream.close();
    this.text = this.text.replace(/<BR>/g,'\n');
    //~ dump('\n<-note_charger');
    return true;
  }
}

Note.prototype.createTempFile = function() {
  this.tempFile = this.notesFile.parent.clone();
  this.tempFile.append("~"+this.notesFile.leafName+".tmp");
  this.tempFile.createUnique(this.tempFile.NORMAL_FILE_TYPE, 0600);
}

/**
 * Save the note in a file with the name of the message-id. If the content
 * of an existing note is empty, e.g., text was deleted, the note will be
 * deleted.
 */
Note.prototype.saveNote = function () {
  //~ dump('\n->saveNote');
  	
  if (this.text=='') {
    if (this.notesFile.exists()) {
      this.notesFile.remove(false);
    }
    return false;
  }
  //	this.notesFile.create(this.notesFile.NORMAL_FILE_TYPE, 0600);
  this.text = this.text.replace(/\n/g,'<BR>');
  with (this.stream) {
    init(this.tempFile, 2, 0x200, false); // Opens for writing only
    write(this.x, 4);
    write(this.y, 4);
    write(this.width, 4);
    write(this.height, 4);
    write(this.modificationDate, 32);

    // Changed because of this:
    // Just one comment - seems like xnote doesnt allow non-latin characters. 
    // I am from Latvia (Letonnie in French I believe) and we have characters
    // like al�ki which are not preserved when saving a note ...    
    //
    // stream.write(this.text, this.text.length);
    var contentencode = encodeURIComponent(this.text);
    write(contentencode, contentencode.length);

    close();
    }
  this.tempFile.moveTo(null, this.notesFile.leafName);
  this.setModified(false);
  //~ dump('\n<-note_sauver');
  return true;
}

/**
 * Deletes the note on the disk drive.
 */
Note.prototype.deleteNote = function () {

  //~ dump('\n->note_supprimer');
  if (this.tempFile && this.tempFile.exists()) {
    this.tempFile.remove(false);
  }
  if (this.notesFile.exists()) {
    this.notesFile.remove(false);
    //~ dump('\n->note_supprimer');
    return true;
  }
  else
  {
    //~ dump('\n->note_supprimer');
    return false;
  }
}

Note.prototype.toString = function(){
  return ('\n'+this.x+' ; '+this.y+' ; '+this.width+' ; '+this.height+' ; '+this.text+' ; ')
}
