// encoding ='UTF-8'

/**
	# File : xnote-overlay.js
	# Author : Hugo Smadja, Pierre-Andre Galmes, Lorenz Froihofer
	# Description : functions associated to the "xnote-overlay.xul" overlay file.
*/

/* TODO
 *
 * - Create a "constant.js" - move the default name and color for the label.
 *
 * - import/export procedure:
 *  - a specific procedure should be used to import notes from a PC to another.
 *  - on export, all messages should be zipped.
 *  - on import, all messages should be unzipped.
 *  - on import, the label XNote should be applied to all messages with notes.
 *
 */

/* 
 * Tag management principles and thoughts

 - When XNote is used, if the XNote label doesn't exists, it is created.
 - When XNote is used, if the XNote label exists, it is not redifined and its
   color is kept.
 
 - When should labels be applied?
    - When a new post-it is saved.
    - When XNote notes are imported from a PC to another PC (cf TODO: import
      procedure).

 - When should the XNote label related to a message be removed?
    - When the message is empty (no text in it).
    - When the message is removed.

 - What should happened when XNote is removed?
  - Remove the XNote tag ? No
  - Remove the XNote labels associated to messages? No


*/
if (!net) var net = {};
if (!net.froihofer) net.froihofer={};
if (!net.froihofer.xnote) net.froihofer.xnote={};

Components.utils.import("resource://gre/modules/errUtils.js");


net.froihofer.xnote.Overlay = function() {
  // CONSTANT - Default Name and Color
  const XNOTE_TAG_NAME = "XNote";
  const XNOTE_TAG_COLOR = "#FFCC00";
  const XNOTE_VERSION = "2.2.2";

  const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
  const SEAMONKEY_ID = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}";

  var pub = function(){};

  //Used to distinguish between Thunderbird and Seamonkey
  var runningThunderbird;

  // Global variables related to the files path.
  var CR ='';
  var CRLen =0;
  var dirSeparator = '/';

  // Path to storage directory of the notes.
  var storagePath;

  // Var whether Tags should be used
  // defaults to true/1 set in defaults.js but can be changed in about:config
  var useTag;

  // Variables related to the XNote Contextual Menu.
  var noteForRightMouseClick;
  var currentIndex;
  
  //Contains the note for the current message
  var note;

  // Variable containing the window instance (post-it).
  var xnoteWindow;

  /* permet de savoir si le post-it a été ouvert à la demande de l'utilisateur ou
     automatiquement lors de la sélection d'un mail afain de donner ou non le focus au post-it
  */
  var gEvenement;

  /**
   * CALLER XUL
   * type	: event load element XUL <toolbarbutton>
   * id	: button-xnote
   * FUNCTION
   * Executed to load the note before it is displayed on the screen.
   * Here we can change the style of the window dynamically
   */
  pub.initialise = function (event) {

    // Test if the tag XNote already exists.
    // If not, create it
    //
    // Note: Maybe this is not the best place to put this code.
    // Try to find a place where to launch it only one time when thunderbird is
    // started.

    //Initialise prefs
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
    getService(Components.interfaces.nsIPrefBranch);

    //take preference for whether tags should be used
    useTag = prefs.getBoolPref("xnote.usetag");

    if(useTag == 1) {
      // Get the tag service.
      var tagService = Components.classes["@mozilla.org/messenger/tagservice;1"]
                               .getService(Components.interfaces.nsIMsgTagService);

      // Test if the XNote Tag already exists, if not, create it
      if( tagService.getKeyForTag( XNOTE_TAG_NAME ) == '' ) {
        // window.alert( "NOT FOUND XNOTE_TAG_NAME" );
        tagService.addTag( XNOTE_TAG_NAME, XNOTE_TAG_COLOR, '');
      }

    }
    //~ dump('\n->initialise');

    //Closes the note (if any) of the old (deselected) message.
    pub.closeNote();

    //Initialize note for the newly selected message
    note = new net.froihofer.xnote.Note(pub.getNotesFile(pub.getMessageID()));
    pub.updateTag( note.text );

    var bundle = document.getElementById('string-bundle');

    //~ dump('\nevenement = '+evenement);
    if (event) {
      //~ dump('\nevenement=true');
      gEvenement = event;
    }
    if (note.text != '' || gEvenement=='clicBouton') {
      xnoteWindow = window.openDialog(
        'chrome://xnote/content/xnote-window.xul',
        'XNote',
        'chrome=yes,dependent=yes,resizable=yes,modal=no,left='+(window.screenX + note.x)+',top='+(window.screenY + note.y)+',width='+note.width+',height='+note.height,
        note, gEvenement
        );
    }
    gEvenement = '';
  //~ dump('\n<-initialise');
  }

  /**
   * CALLER XUL
   * Type: event command element XUL <menuitem>
   * Id: context-addition
   * FUNCTION
   * Creation and modification of notes uses the same function, that is context_modifierNote()
   */
  pub.context_createNote = function () {
    pub.context_modifyNote();
  }

  /**
   * CALLER XUL
   * Type: event command element XUL <menuitem>
   * Id: context-modif
   * FUNCTION
   * There is an issue when right clicking on another email than currently selected.
   * After the menu has disappeared, the mail selected before right clicking is again selected.
   * Thus, the creation of the notes will not be on the correct mail. To avoid this, we
   * currently do not enable the XNote context menu if the right click is not on
   * the currently selected message.
   */
  pub.context_modifyNote = function () {
    gEvenement = 'clicBouton';	//specifies that the post-it will be posted by the user
    if (gDBView.selection.currentIndex==currentIndex) {
      //if you right click on the mail stream (one selected)
      pub.initialise();
    }
    else {
      gDBView.selection.select(currentIndex);
      gDBView.selectionChanged();
      // The following prevents the previous message selection from
      // being restored during closing of the context menu.
      // Variable not present in SeaMonkey --> check to prevent errors.
      if (runningThunderbird) {
        gRightMouseButtonSavedSelection.realSelection.select(currentIndex);
      }
    }
  }

  /**
   * APPELANT XUL
   * type	: évènement command de l'élément XUL <menuitem>
   * id	: context-suppr
   * FONCTION
   * Supprime la note associé au mail cliqué droit.
   */
  pub.context_deleteNote = function () {
    noteForRightMouseClick.deleteNote();
    pub.updateTag("");
    setTimeout("net.froihofer.xnote.Overlay.initialise('')");
  }

  pub.context_resetNoteWindow = function () {
    if (gDBView.selection.currentIndex==currentIndex) {
      xnoteWindow.resizeTo(noteForRightMouseClick.DEFAULT_XNOTE_WIDTH, noteForRightMouseClick.DEFAULT_XNOTE_HEIGHT);
      xnoteWindow.moveTo(noteForRightMouseClick.DEFAULT_X, noteForRightMouseClick.DEFAULT_Y)
      note.setModified(true);
    }
    else {
      noteForRightMouseClick.x = noteForRightMouseClick.DEFAULT_X;
      noteForRightMouseClick.y = noteForRightMouseClick.DEFAULT_Y;
      noteForRightMouseClick.width = noteForRightMouseClick.DEFAULT_XNOTE_WIDTH;
      noteForRightMouseClick.height = noteForRightMouseClick.DEFAULT_XNOTE_HEIGHT;
      noteForRightMouseClick.setModified(true);
      noteForRightMouseClick.saveNote();
    }
  }

  /**
   * FONCTION
   * Si le post-it est affiché, on le ferme
   */
  pub.closeNote = function () {
    if (xnoteWindow != null && xnoteWindow.document) {
      xnoteWindow.close();
    }
  }

  /**
   * FUNCTION
   * Applies the XNote tag to the selected message.
   * (Choice of tag in the preferences.)
   */
  pub.updateTag = function ( noteText ) {
    // dump('\n->updateTag');

    //whether to use tags or not
    if(useTag == 1) {
      var tagService = Components.classes["@mozilla.org/messenger/tagservice;1"]
                         .getService(Components.interfaces.nsIMsgTagService);

      var key = tagService.getKeyForTag( XNOTE_TAG_NAME );

      // If the note isn't empty,
      if( noteText != '' ) {
        // Add the XNote Tag.
        ToggleMessageTag(key, true);
      }
      // If the note is empty,
      else {
        // Remove the XNote Tag.
        ToggleMessageTag(key, false);
      }
    //~ dump('\n<-updateTag');
    }
  }

  /**
   * FUNCTION
   * For right click in message pane:
   *   - Instantiates an object notes for the message on which was clicked
   *   - Functions that are not currently possible are greyed out in the context
   *     menu, e.g., modify or delete a note for a message not containing a note.
   */
  pub.messageListClicked = function (e) {
    //~ dump('\n->messageListClicked');
    if (e.button==2) {
      var notesFile = pub.getNotesFile(pub.getMessageID());
      noteForRightMouseClick = new net.froihofer.xnote.Note(notesFile);
      var noteFileExists = notesFile.exists();
      document.getElementById('context-ajout').setAttribute('hidden', noteFileExists);
      document.getElementById('context-modif').setAttribute('hidden', !noteFileExists);
    }
    var t = e.originalTarget;
    if (t.localName == 'treechildren') {
      var row = new Object;
      var col = new Object;
      var childElt = new Object;

      var tree = GetThreadTree();
      tree.treeBoxObject.getCellAt(e.clientX, e.clientY, row, col, childElt);
      currentIndex = row.value;
    //~ dump('\nrow.value = '+row.value);
    }
  //~ dump('\n<-messageListClicked');
  }

  /**
   * Initializes environment-dependent variables, e.g. OS-specific path
   * separators.
   */
  this.initEnv = function () {
    if (navigator.platform.toLowerCase().indexOf('win') != -1) {
      CR = '\r';
      CRLen = CR.length;
      dirSeparator= '\\';
    }

    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]  
                            .getService(Components.interfaces.nsIXULAppInfo);  
    if(appInfo.ID == THUNDERBIRD_ID) {
      runningThunderbird = true;
    }
    else {
      runningThunderbird = false;
    }
  }

  /**
   * Returns a handle to the notes file for the provided message ID. Note
   * that a physical file might not exist on the file system, if the message
   * has no note.
   */
  pub.getNotesFile = function (messageId) {
    var notesFile =	Components.classes['@mozilla.org/file/local;1']
                           .createInstance(Components.interfaces.nsILocalFile);
    //~ dump('\n'+pub.getNoteStoragePath()+'\n'+messageID);
    notesFile.initWithPath(pub.getNoteStoragePath()+escape(messageId).replace(/\//g,"%2F")+'.xnote');
    return notesFile;
    //~ dump('\n'+pub.getNoteStoragePath()+messageID+'.xnote');
  }

  this.updateStoragePath = function() {
    var directoryService = 	Components.classes['@mozilla.org/file/directory_service;1']
                            .getService(Components.interfaces.nsIProperties);
    var profileDir = directoryService.get('ProfD', Components.interfaces.nsIFile);
    var defaultPath = profileDir.path + dirSeparator + 'XNote' + dirSeparator;
    try {
      var prefs = Components.classes['@mozilla.org/preferences-service;1']
                             .getService(Components.interfaces.nsIPrefService)
                             .getBranch("xnote.")
      var pathPref = prefs.getCharPref('storage_path');
      if (pathPref && pathPref.trim() != "") {
        if (pathPref.lastIndexOf(dirSeparator) != pathPref.length -1) {
          pathPref += dirSeparator;
        }
        if (pathPref.indexOf("[ProfD]") == 0) {
          storagePath = profileDir.path + dirSeparator + pathPref.substring(7);
        }
        else {
          storagePath = pathPref;
        }
      }
      else {
        storagePath = defaultPath;
      }
    }
    catch (e) {
      storagePath = defaultPath;
    }
//    ~ dump("\nxnote: storagePath="+storagePath);
  }

  /**
   * Retrieves the path of the directory that stores notes
   */
  pub.getNoteStoragePath = function() {
    return storagePath;
  }

  /**
   * Get message id from selected message
   */
  pub.getMessageID = function () {
    var message = gFolderDisplay.selectedMessage;
    if (message != null) return message.messageId;
    return null;
  }

  /**
   * Enable XNote button for a single selected message.
   * Disable XNote button if no or several mails are selected.
   */
  pub.updateXNoteButton = function () {
    var messageArray = {};
    messageArray = gFolderDisplay.selectedMessages;
    var xnoteButton = document.getElementById('button-xnote');
    if (messageArray && messageArray.length==1) {
      if (xnoteButton) {
        xnoteButton.setAttribute('disabled', false);
      }
      document.getElementById('mailContext-xNote').setAttribute('disabled', false);
    }
    else {
      if (xnoteButton) {
        xnoteButton.setAttribute('disabled', true);
      }
      document.getElementById('mailContext-xNote').setAttribute('disabled', true);
      pub.closeNote();
    }
  }

  /**
   * This function is executed at the first boot after installing the extension.
   * It adds the XNote icon at the end of the toolbar.
   */
  pub.firstBoot = function () {
    var pref = Components.classes['@mozilla.org/preferences-service;1']
                           .getService(Components.interfaces.nsIPrefBranch);
    var addButton = false;
    if (pref.prefHasUserValue("xnote.version")) {
      var num = pref.getCharPref('xnote.version');
      if(num!=XNOTE_VERSION) {
        pref.setCharPref('xnote.version', XNOTE_VERSION);
        addButton = true;
      }
    }
    else {
      pref.setCharPref('xnote.version', XNOTE_VERSION);
      addButton = true;
    }

    if(addButton) {
      var toolbox = document.getElementById("mail-toolbox");
      var toolboxDocument = toolbox.ownerDocument;

      var xnoteButtonPresent = false;
      var toolbars = document.evaluate(".//.[local-name()='toolbar' and @customizable='true']", toolbox, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      var toolbar = toolbars.iterateNext();
      while(toolbar && !xnoteButtonPresent) {
        //~dump("\n\nChecking toolbar '"+toolbar.id+"', currentSet="+toolbar.currentSet);
        if(toolbar.currentSet.indexOf("button-xnote")>-1) {
          xnoteButtonPresent = true;
          //~dump("\nFound XNote button.");
        }
        toolbar = toolbars.iterateNext();
      }

      if(!xnoteButtonPresent) try {
        var toolbar = document.getElementById("mail-bar3");
        if (!runningThunderbird) {
          toolbar = document.getElementById("msgToolbar");
        }
        var buttons = toolbar.currentSet.split(",");
        var newSet = "";
        for (var i = 0; i<buttons.length; i++) {
          if( !xnoteButtonPresent && buttons[i] == "spring" ) {
            newSet += "button-xnote,";
            xnoteButtonPresent = true;
          }
          newSet += buttons[i]+",";
        }
        if (xnoteButtonPresent) {
          newSet = newSet.substring(0, newSet.length-1);
        }
        else {
          newSet = toolbar.currentSet + ",button-xnote";
        }
        toolbar.currentSet = newSet;

        toolbar.setAttribute("currentset", newSet);
        toolboxDocument.persist(toolbar.id, "currentset");
      }
      catch (e) {
        var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                        .getService(Components.interfaces.nsIConsoleService);
        consoleService.logStringMessage("Could not add XNote button: "+e);
        ~dump("\nCould not add XNote button: "+e+"\n"+e.stack);
      }
    }
  }

  var prefObserver = {
    observe : function(subject, topic, data) {
//      ~ dump("\nxnote pref observer called, topic="+topic+", data="+data);
      if (topic != "nsPref:changed") {
       return;
      }

      switch(data) {
       case "xnote.storage_path":
         updateStoragePath();
         break;
      }
    }
  }

  /**
   * At each boot of the extension, associate events such as selection of mails,
   * files, or right click on the list of messages. On selection show the associated
   * note.
   */
  pub.onLoad = function (e) {
    initEnv();
    updateStoragePath();
    var prefs = Components.classes['@mozilla.org/preferences-service;1']
                           .getService(Components.interfaces.nsIPrefBranch2)
    prefs.addObserver("xnote.", prefObserver, false);
    if (String(EnsureSubjectValue).search('extensionDejaChargee')==-1) {
      var oldEnsureSubjectValue=EnsureSubjectValue;
      EnsureSubjectValue=function(){
        var extensionDejaChargee ;
        oldEnsureSubjectValue();
        setTimeout("net.froihofer.xnote.Overlay.initialise('')");
      };
    }
    try {
      var tree = document.getElementById('folderTree');
      tree.addEventListener('select', pub.closeNote, false);
      tree.addEventListener('select', pub.updateXNoteButton, false);
      tree = document.getElementById('threadTree');
      tree.addEventListener('click', pub.messageListClicked, false);
      tree = document.getElementById('threadTree');
      tree.addEventListener('select', pub.updateXNoteButton, false);
    }
    catch(e){
      logException(e,false);
    }
    pub.firstBoot();
  }

  return pub;
}();

addEventListener('load', net.froihofer.xnote.Overlay.onLoad, true);
