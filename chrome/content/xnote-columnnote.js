
/*
 * Get the notes file associated with the selected mail. Returns a handle to the
 * notes file if the message has a note, i.e., the corresponding file exists.
 * Returns null otherwise.
 */
function hasNote(messageID) {
  var msgid=messageID;
  initEnv();
  var notesFile =	Components.classes['@mozilla.org/file/local;1']
                        .createInstance(Components.interfaces.nsILocalFile);
  //~ dump('\nhasNote: '+getNoteStoragePath()+'\n'+messageID);
  notesFile.initWithPath(getNoteStoragePath()+msgid+'.xnote');
	
  if(notesFile.exists()){
    return true;
  }else{
    return false;
  }
//~ dump('\n'+getNoteStoragePath()+messageID+'.xnote');
}


var columnHandler = {
  getCellText:         function(row, col) {
    return null;
  },
  getSortStringForRow: function(hdr) {  
    return hasNote(hdr.messageId);
  },
  isString:            function() {
    return true;
  },

  getCellProperties:   function(row, col, props){},
  getRowProperties:    function(row, props){},
  getImageSrc:         function(row, col) {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.getFolderForViewIndex(row).GetMessageHeader(key);
    if(hasNote(hdr.messageId)){
      return "chrome://xnote/skin/xnote_context.png";
    }
    else {
      return null;
    }
  },
  getSortLongForRow:   function(hdr) {
    return hasNote(hdr.messageId);
  }
}

window.addEventListener("load", doOnceLoaded, false);

function doOnceLoaded() {
  var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);
}

var CreateDbObserver = {
  // Components.interfaces.nsIObserver
  observe: function(aMsgFolder, aTopic, aData) {  
    addCustomColumnHandler();
  }
}
function addCustomColumnHandler() {
  gDBView.addColumnHandler("colNote", columnHandler);
}
