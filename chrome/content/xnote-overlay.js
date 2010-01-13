// encoding ='UTF-8'

/**
	# File : xnote-overlay.xul
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

Components.utils.import("resource://gre/modules/errUtils.js");

// CONSTANT - Default Name and Color
const XNOTE_TAG_NAME = "XNote";
const XNOTE_TAG_COLOR = "#FFCC00";

// Global variables related to the files path.
var CR ='';
var CRLen =0;
var separateur = '/';

// Var whether Tags should be used
// defaults to true/1 set in defaults.js but can be changed in about:config
var useTag;

// Global variables related to the XNote Contextual Menu.
var noteForRightMouseClick;
var currentIndex;

// variable stockant l'instance de la fenêtre (post-it).
// Global variables containing the window instance (post-it).
var w;

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
function initialise(evenement) {

  // Test if the tag XNote already exists.
  // If not, create it
  //
  // Note: it is maybe not the best place to put this code.
  // Try to find a place where to launch it only one time when thunderbird is
  // started.
	
  //Initialise prefs
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
  getService(Components.interfaces.nsIPrefBranch);
	
  //take preference for whether tags should be used
  useTag = prefs.getBoolPref("xnote.usetag");
	  
  if(useTag == 1)
  {
    // Get the tag service.
    var tagService = Components.classes["@mozilla.org/messenger/tagservice;1"]
                             .getService(Components.interfaces.nsIMsgTagService);
	
    // Test if the XNote Tag already exists, if not, create it
    if( tagService.getKeyForTag( XNOTE_TAG_NAME ) == '' )
    {
      // window.alert( "NOT FOUND XNOTE_TAG_NAME" );
      tagService.addTag( XNOTE_TAG_NAME, XNOTE_TAG_COLOR, '');
    }

  }
  // dump('\n->initialise');

  //Closes the note (if any) of the old (deselected) message.
  closeNote();

  //Initialize note for the newly selected message
  var note = new Note(getNotesFile());
	
  updateTag( note.text );

  var bundle = document.getElementById('string-bundle');
	
	
  //~ dump('\nevenement = '+evenement);
  if (evenement)
  {
    //~ dump('\nevenement=true');
    gEvenement = evenement;
  }
  if (note.text != '' || gEvenement=='clicBouton')
  {
    w = window.openDialog
    (
      'chrome://xnote/content/xnote-window.xul',
      'XNote',
      'chrome=yes,dependent=yes,resizable=yes,modal=no,left='+note.x+',top='+note.y+',width='+note.width+',height='+note.height,
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
function context_createNote()
{
  context_modifyNote();
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
function context_modifyNote()
{
  gEvenement = 'clicBouton';	//specifies that the post-it will be posted by the user
  if (gDBView.selection.currentIndex==currentIndex) {
  	//if you right click on the mail stream (one selected)
    initialise();
  }
  else {
    //This should not be reached as the XNote context menu is
    //disabled if the right mouse click is not on the currently selected message
    //See messageListClicked
//    gDBView.selection.currentIndex = currentIndex;
//    gDBView.selectionChanged();
  }
}

/** 
 * APPELANT XUL
 * type	: évènement command de l'élément XUL <menuitem>
 * id	: context-suppr
 * FONCTION
 * Supprime la note associé au mail cliqué droit.
 */
function context_deleteNote() {
  noteForRightMouseClick.deleteNote();
  setTimeout("initialise('')");
}

/** 
 * FONCTION
 * Si le post-it est affiché, on le ferme
 */
function closeNote()
{
  if (w != null && w.document)
  {
    w.close();
  }
}

/** 
 * FUNCTION
 * Applies the XNote tag to the selected message.
 * (Choice of tag in the preferences.)
 */
function updateTag( noteText )
{
  // dump('\n->updateTag');

  // alert( "Etiquette courante" );

  //whether to use tags or not
  if(useTag == 1)
  {
    var tagService = Components.classes["@mozilla.org/messenger/tagservice;1"]
    .getService(Components.interfaces.nsIMsgTagService);

    var key = tagService.getKeyForTag( XNOTE_TAG_NAME );


    // If the note isn't empty,
    if( noteText != '' )
    {
      // Add the XNote Tag.
      ToggleMessageTag(key, true);
	
    }
    // If the note is empty,
    else
    {
      // Remove the XNote Tag.
      ToggleMessageTag(key, false);
    }
  //~ dump('\n<-updateTag');
  }
}

/* FUNCTION
 * For right click in message pane:
 *   - Instantiates an object notes for the message on which was clicked
 *   - Functions that are not currently possible are greyed out in the context
 *     menu, e.g., modify or delete a note for a message not containing a note.
 */
function messageListClicked(e) {
  //~ dump('\n->messageListClicked');
  if (e.button==2)
  {
    noteForRightMouseClick = new Note(getNotesFile());
    var noteFileExists = noteForRightMouseClick.notesFile.exists();
    document.getElementById('context-ajout').setAttribute('disabled', noteFileExists);
    document.getElementById('context-modif').setAttribute('disabled', !noteFileExists);
    var t = e.originalTarget;
    if (t.localName == 'treechildren')
    {
      var row = new Object;
      var col = new Object;
      var childElt = new Object;

      var tree = GetThreadTree();
      tree.treeBoxObject.getCellAt(e.clientX, e.clientY, row, col, childElt);
      currentIndex = row.value;
      document.getElementById('mailContext-xNote').setAttribute('disabled', currentIndex != gDBView.selection.currentIndex)
    //~ dump('\nrow.value = '+row.value);
    }
  }
//~ dump('\n<-messageListClicked');
}

/**
 * Initializes the environment variables related to the operating system.
 */
function initEnv()
{
  if (navigator.platform.toLowerCase().indexOf('win') != -1)
  {
    CR = '\r';
    CRLen = CR.length;
    separateur= '\\';
  }
}

/*
 * Get the notes file associated with the selected mail. If the mail has a note when the file exists
 * And the function returns a handle to this file. Otherwise, it returns null.
 */
function getNotesFile() {
  initEnv();
  var notesFile =	Components.classes['@mozilla.org/file/local;1']
                         .createInstance(Components.interfaces.nsILocalFile);
  //~ dump('\n'+getNoteStoragePath()+'\n'+messageID);
  notesFile.initWithPath(getNoteStoragePath()+getMessageID()+'.xnote');
  return notesFile;
//~ dump('\n'+getNoteStoragePath()+messageID+'.xnote');
}

/**
 * Retrieves the path of the directory that stores notes
 */
function getNoteStoragePath() {
  var serviceDossier = 	Components.classes['@mozilla.org/file/directory_service;1']
                          .getService(Components.interfaces.nsIProperties);
  var dossierProfile = serviceDossier.get('ProfD', Components.interfaces.nsIFile);
  return dossierProfile.path + separateur + 'XNote' + separateur;
}

/**
 * Get message id from selected message
 */
function getMessageID() {
  var message = gFolderDisplay.selectedMessage;
  if (message != null) return message.messageId;
  return null;
}

/**
 * Enable XNote button for a single selected message.
 * Disable Xnote button if no or several mails are selected.
 */
function updateXNoteButton() {
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
    closeNote();
  }
}

/**
 * This function is executed at the first boot after installing the extension.
 * It adds the XNote icon at the end of the toolbar.
 */
function firstBoot() {
  var bundle = document.getElementById('string-bundle');
  var pref = Components.classes['@mozilla.org/preferences-service;1']
                         .getService(Components.interfaces.nsIPrefBranch);
  var version  = bundle.getString('version');
  var ajoutBouton = false;
  try
  {
    var num = pref.getCharPref('xnote.version');
    if(num!=version)
    {
      pref.setCharPref('xnote.version', version);
      ajoutBouton = true;
    }
  }
  catch(e)
  {
    pref.setCharPref('xnote.version', version);
    ajoutBouton = true;
  }
	
  if(ajoutBouton)
  {
    var toolbox = document.getElementById("mail-toolbox");
    var toolboxDocument = toolbox.ownerDocument;
    
    var boutonXNotePresent = false;
    for (var i = 0; i < toolbox.childNodes.length; ++i)
    {
      var toolbar = toolbox.childNodes[i];
      if (toolbar.localName == "toolbar" && toolbar.getAttribute("customizable")=="true")
      {
        if(toolbar.currentSet.indexOf("button-xnote")>-1)
          boutonXNotePresent = true;
      }
    }
		
    if(!boutonXNotePresent)
    {
      for (var i = 0; i < toolbox.childNodes.length; ++i)
      {
        toolbar = toolbox.childNodes[i];
        if (toolbar.localName == "toolbar" &&  toolbar.getAttribute("customizable")=="true" && toolbar.id=="mail-bar")
        {
							
          var newSet = "";
          var child = toolbar.firstChild;
          while(child)
          {
            if( !boutonXNotePresent && child.id == "spring1151595229388" )
            {
              newSet += "button-xnote,";
              boutonXNotePresent = true;
            }

            newSet += child.id+",";
            child = child.nextSibling;
          }

          newSet = newSet.substring(0, newSet.length-1);
          toolbar.currentSet = newSet;

          toolbar.setAttribute("currentset", newSet);
          toolboxDocument.persist(toolbar.id, "currentset");
          MailToolboxCustomizeDone(true);
          break;
        }
      }
    }
  }
}

/**
 * At each boot of the extension, associate events such as selection of mails,
 * files, or right click on the list of messages. On selection show the associated
 * note.
 */
function onLoad(e) {
  if (String(EnsureSubjectValue).search('extensionDejaChargee')==-1)
  {
    var oldEnsureSubjectValue=EnsureSubjectValue;
    EnsureSubjectValue=function(){
      var extensionDejaChargee ;
      oldEnsureSubjectValue();
      setTimeout("initialise('')");
    };
  }
  try
  {
    var tree = document.getElementById('folderTree');
    tree.addEventListener('select', closeNote, false);
    tree = document.getElementById('threadTree');
    tree.addEventListener('click', messageListClicked, false);
    tree = document.getElementById('threadTree');
    tree.addEventListener('select', updateXNoteButton, false);
  }
  catch(e){
    logException(e,false);
  }
  firstBoot();
}

addEventListener('load', onLoad, true);
