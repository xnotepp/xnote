
/*
 * Récupère le fichier de note associée au mail sélectionné. Si le mail possède une note alors le fichier existe
 * et la fonction renvoie un descripteur de ce fichier. Sinon, elle renvoie null.
 */
function hasNote(messageID)
{ 
	var msgid=messageID;
	initEnv();
	var fichierNote =	Components.classes['@mozilla.org/file/local;1']
						.createInstance(Components.interfaces.nsILocalFile);
	//~ dump('\n'+getCheminDossierNote()+'\n'+messageID);
	fichierNote.initWithPath(getCheminDossierNote()+msgid+'.xnote');
	
	if(fichierNote.exists()){
		return true;
	}else{
		return false;
	}
	//~ dump('\n'+getCheminDossierNote()+messageID+'.xnote');
}


var columnHandler = {
   getCellText:         function(row, col) {
   	
      var key = gDBView.getKeyAt(row);
      var hdr = gDBView.db.GetMsgHdrForKey(key);
      
      var messageID= hdr.messageId;
  
   
	//return hasNote(messageID);
		return null;
	      
   },
   getSortStringForRow: function(hdr) {     
   
    var key = gDBView.getKeyAt(row);
      var hdr = gDBView.db.GetMsgHdrForKey(key);
      
      var messageID= hdr.messageId;
  
   
	return hasNote(messageID);},
   isString:            function() {return true;},

   getCellProperties:   function(row, col, props){},
   getRowProperties:    function(row, props){},
   getImageSrc:         function(row, col) {
   	    var key = gDBView.getKeyAt(row);
      var hdr = gDBView.db.GetMsgHdrForKey(key);
      
      var messageID= hdr.messageId;
   	if(hasNote(messageID)==true){
	return "chrome://xnote/skin/xnote_context.png";
	}else {
		
		return null;
	}
},
   getSortLongForRow:   function(hdr) {return 0;}
}

window.addEventListener("load", doOnceLoaded, false);

function doOnceLoaded() {
  var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);
}

var CreateDbObserver = {
  // Components.interfaces.nsIObserver
  observe: function(aMsgFolder, aTopic, aData)
  {  
     addCustomColumnHandler();
  }
}
function addCustomColumnHandler() {
   gDBView.addColumnHandler("colNote", columnHandler);
}