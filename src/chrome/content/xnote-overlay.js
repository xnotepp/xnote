// encoding ='UTF-8'

/*
  # File : xnote-overlay.js
  # Author : Hugo Smadja, Pierre-Andre Galmes, Lorenz Froihofer
  # Description : functions associated to the "xnote-overlay.xul" overlay file.
*/

/* 
 Tag management principles and thoughts
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


if (!ExtensionParent) var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
if (!xnoteExtension) var xnoteExtension = ExtensionParent.GlobalManager.getExtension("xnote@froihofer.net");
var { xnote } = ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/xnote.jsm"));
if (!xnote.ns) xnote.ns = {};
ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/commons.jsm"), xnote.ns);
ChromeUtils.import(xnoteExtension.rootURI.resolve("chrome/modules/storage.jsm"), xnote.ns);

xnote.ns.Overlay = function () {
  //result
  var pub = {};

  // Variables related to the XNote context menu.
  var noteForContextMenu;
  var currentIndex;

  /** Contains the note for the current message */
  var note;

  /** Contains the XNote window instance. */
  var xnoteWindow;

  /**
   * Indicates whether the post-it has been opened at the request of the user or
   * automatically when selecting an email.
   */
  var initSource;

  /**
   * CALLER XUL
   * type	: event load element XUL <toolbarbutton>
   * id	: button-xnote
   * FUNCTION
   * Executed to load the note before it is displayed on the screen.
   * Here we can change the style of the window dynamically
   */
  pub.initialise = function (event) {
    // ~ dump('\n->initialise, messageId='+pub.getMessageID());
    //Closes the note (if any) of the old (deselected) message.
    pub.closeNote();

    //Initialize note for the newly selected message
    note = new xnote.ns.Note(pub.getMessageID());
    pub.updateTag(note.text);


    let msgDisplaytext = note.modificationDate + "  " + note.text;

    notifyTools.notifyBackground({ command: "addToMsgDisplay", text: note.text, date: note.modificationDate }).then((data) => {
      //console.log(data);
    });


    let xnotePrefs = xnote.ns.Commons.xnotePrefs;
    if ((xnotePrefs.show_on_select && note.text != '')
      || initSource == 'clicBouton' || event == 'clicBouton') {
      xnoteWindow = window.openDialog(
        'chrome://xnote/content/xnote-window.xhtml',
        'XNote',
        'chrome=yes,dependent=yes,resizable=yes,modal=no,left=' + (window.screenX + note.x) + ',top=' + (window.screenY + note.y) + ',width=' + note.width + ',height=' + note.height,
        note, (initSource == 'clicBouton' || event == 'clicBouton' ? 'clicBouton' : null)
      );
 
    }
    initSource = '';
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
   */
  pub.context_modifyNote = function () {
    initSource = 'clicBouton';	//specifies that the note is created by the user

    if (gDBView.selection.currentIndex == currentIndex) {
      //if you right click on the mail stream (one selected)
      pub.initialise();
    }
    else {
      gDBView.selection.select(currentIndex);
      gDBView.selectionChanged();
      // The following prevents the previous message selection from
      // being restored during closing of the context menu.
      // Variable not present in SeaMonkey --> check to prevent errors.
      if (xnote.ns.Commons.isInThunderbird) {
        gRightMouseButtonSavedSelection.realSelection.select(currentIndex);
      }
    }
  }

  /**
   * CALLER XUL
   * Type: event command element XUL &lt;menuitem&gt;
   * Id: context-suppr
   * FUNCTION
   * Delete the note associated with the selected e-mail.
   */
  pub.context_deleteNote = function () {
    noteForContextMenu.deleteNote();
    pub.updateTag("");
    setTimeout(xnote.ns.Overlay.initialise);
  }

  pub.context_resetNoteWindow = function () {
    if (gDBView.selection.currentIndex == currentIndex) {
      xnoteWindow.resizeTo(noteForContextMenu.DEFAULT_XNOTE_WIDTH, noteForContextMenu.DEFAULT_XNOTE_HEIGHT);
      xnoteWindow.moveTo(noteForContextMenu.DEFAULT_X, noteForContextMenu.DEFAULT_Y)
      note.modified = true;
    }
    else {
      noteForContextMenu.x = noteForContextMenu.DEFAULT_X;
      noteForContextMenu.y = noteForContextMenu.DEFAULT_Y;
      noteForContextMenu.width = noteForContextMenu.DEFAULT_XNOTE_WIDTH;
      noteForContextMenu.height = noteForContextMenu.DEFAULT_XNOTE_HEIGHT;
      noteForContextMenu.modified = true;
      noteForContextMenu.saveNote();
    }
  }

  /**
   * Closes the XNote window.
   */
  pub.closeNote = function () {
    //   let xnoteWindow = xnote.ns.Overlay.xnoteWindow;
    if (xnoteWindow != null && xnoteWindow.document) {
      xnoteWindow.close();
    }
  }

  /**
   * FUNCTION
   * Applies the XNote tag to the selected message.
   * (Choice of tag in the preferences.)
   */
  pub.updateTag = function (noteText) {
    // dump('\n->updateTag');
    if (xnote.ns.Commons.useTag) {
      // If the note isn't empty,
      if (noteText != '') {
        // Add the XNote Tag.
        ToggleMessageTag("xnote", true);
      }
      // If the note is empty,
      else {
        // Remove the XNote Tag.
        ToggleMessageTag("xnote", false);
      }
      //~ dump('\n<-updateTag');
    }
  }

  function updateContextMenu() {
    //debugger;
    noteForContextMenu = new xnote.ns.Note(pub.getMessageID());
    let noteExists = noteForContextMenu.exists();
    /* Commented until button will be re-enabled in manifest.json 
      ("message_display_action" removed in earlier commit).
    if (noteExists) xnote.WL.messenger.messageDisplayAction.disable(); else 
         xnote.WL.messenger.messageDisplayAction.enable(); */
    document.getElementById('xnote-context-create').setAttribute('hidden', noteExists);
    document.getElementById('xnote-context-modify').setAttribute('hidden', !noteExists);
    document.getElementById('xnote-context-delete').setAttribute('hidden', !noteExists);
    document.getElementById('xnote-context-separator-after-delete').setAttribute('hidden', !noteExists);
    document.getElementById('xnote-context-reset-note-window').setAttribute('hidden', !noteExists);
    var messageArray = gFolderDisplay.selectedMessages;
    if (messageArray && messageArray.length == 1) {
      document.getElementById('xnote-mailContext-xNote').setAttribute('disabled', false);
    }
    else {
      document.getElementById('xnote-mailContext-xNote').setAttribute('disabled', true);
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
    //~ dump('\n->messageListClicked, messageID='+pub.getMessageID());
    if (e.button == 2) {
      updateContextMenu();
    }
    let t = e.originalTarget;
    if (t.localName == 'treechildren') {
      let tree = GetThreadTree();
      let treeCellInfo = tree.getCellAt(e.clientX, e.clientY);
      currentIndex = treeCellInfo.row;
      //console.log(treeCellInfo.col.cycler);
      //~ dump('\nclicked row = '+currentIndex);
    }
    //~ dump('\n<-messageListClicked');
  }

  pub.getCurrentRow = function (e) {
    //~ dump('\n->messageListClicked, messageID='+pub.getMessageID());
    let t = e.originalTarget;
    if (t.localName == 'treechildren') {
      let tree = GetThreadTree();
      let treeCellInfo = tree.getCellAt(e.clientX, e.clientY);
      currentIndex = treeCellInfo.row;
      //console.log(treeCellInfo.col.cycler);
      //~ dump('\nclicked row = '+currentIndex);
    }
    //~ dump('\n<-messageListClicked');
  }


  pub.messagePaneClicked = function (e) {
    //~ dump('\n->messagePaneClicked, messageID='+pub.getMessageID());
    if (e.button == 2) {
      updateContextMenu();
    }
    currentIndex = gDBView.selection.currentIndex;
  }

  /**
   * Get message id from selected message
   */
  pub.getMessageID = function () {
    let message = gFolderDisplay.selectedMessage;
    if (message != null) return message.messageId;
    return null;
  }

  /**
   * Enable XNote button for a single selected message.
   * Disable XNote button if no or several mails are selected.
   */
  pub.updateXNoteButton = function () {
    let messageArray = gFolderDisplay.selectedMessages;
    let xnoteButton = document.getElementById('xnote_froihofer_net-browserAction-toolbarbutton');
    if (messageArray && messageArray.length == 1) {
      if (xnoteButton) {
        xnoteButton.setAttribute('disabled', false);
      }
      document.getElementById('xnote-mailContext-xNote').setAttribute('disabled', false);
    }
    else {
      if (xnoteButton) {
        xnoteButton.setAttribute('disabled', true);
      }
      document.getElementById('xnote-mailContext-xNote').setAttribute('disabled', true);
      pub.closeNote();
    }
  }

  /**
   * This function checks whether updates are necessary.
   * For example, it adds the XNote icon at the end of the toolbar if
   * XNote has been newly installed.
   */
  pub.checkInitialization = function () {
    if (xnote.ns.Commons.isNewInstallation) {
  //     console.log("First time installation - add the XNote toolbar button.");
      let toolbox = document.getElementById("mail-toolbox");

      let xnoteButtonPresent = false;
      let toolbars = document.evaluate(".//.[local-name()='toolbar' and @customizable='true']", toolbox, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      let toolbar = toolbars.iterateNext();
      while (toolbar && !xnoteButtonPresent) {
        //~dump("\n\nChecking toolbar '"+toolbar.id+"', currentSet="+toolbar.currentSet);
        if (toolbar.currentSet.indexOf("xnote_froihofer_net-browserAction-toolbarbutton") > -1) {
          xnoteButtonPresent = true;
          //~dump("\nFound XNote button.");
        }
        toolbar = toolbars.iterateNext();
      }

      if (!xnoteButtonPresent) try {
        toolbar = document.getElementById("mail-bar3");
        if (!xnote.ns.Commons.isInThunderbird) {
          toolbar = document.getElementById("msgToolbar");
        }
        let buttons = toolbar.currentSet.split(",");
        let newSet = "";
        for (let i = 0; i < buttons.length; i++) {
          if (!xnoteButtonPresent && buttons[i] == "spring") {
            newSet += "xnote_froihofer_net-browserAction-toolbarbutton,";
            xnoteButtonPresent = true;
          }
          newSet += buttons[i] + ",";
        }
        if (xnoteButtonPresent) {
          newSet = newSet.substring(0, newSet.length - 1);
        }
        else {
          newSet = toolbar.currentSet + ",xnote_froihofer_net-browserAction-toolbarbutton";
        }
        toolbar.currentSet = newSet;

        toolbar.setAttribute("currentset", newSet);
        Services.xulStore.persist(toolbar, "currentset");
      }
        catch (e) {
          console.error("Could not add XNote button.", e)
        }
    }
  }

  /**
   * At each boot of the extension, associate events such as selection of mails,
   * files, or right click on the list of messages. On selection show the associated
   * note.
   */
  pub.onLoad = function (e) {
    //console.debug("xnote: overlay.onLoad: "+JSON.stringify(xnote, null, 2)+"\n");

    if (String(EnsureSubjectValue).search('extensionDejaChargee') == -1) {
      let oldEnsureSubjectValue = EnsureSubjectValue;
      EnsureSubjectValue = function () {
        //to prevent duplicate registrations:
        var extensionDejaChargee;
        oldEnsureSubjectValue();
        setTimeout(xnote.ns.Overlay.initialise);
      };
    }
    try {
      let tree = document.getElementById('folderTree');
      tree.addEventListener('select', pub.closeNote, false);
      tree.addEventListener('select', pub.updateXNoteButton, false);
      tree = document.getElementById('threadTree');
      tree.addEventListener('contextmenu', pub.messageListClicked, false);
      tree.addEventListener('select', pub.updateXNoteButton, false);
      tree.addEventListener('mouseover', pub.getCurrentRow, false);
      tree.addEventListener('select', xnote.ns.Overlay.initialise, false);

      let messagePane = document.getElementById("messagepane");
      messagePane.addEventListener("contextmenu", pub.messagePaneClicked, false);
      tree = GetThreadTree();
      if (tree) {
        tree.addEventListener('click', pub.getCurrentRow, false);

      }

    }
    catch (e) {
      logException(e, false);
    }

    //window.addEventListener('DOMAttrModified', xnote.ns.Commons.printEventDomAttrModified, false);

    pub.checkInitialization();
  }

  pub.onUnload = function (e) {
    //console.debug("xnote: overlay.onLoad: "+JSON.stringify(xnote, null, 2)+"\n");


    try {
      let tree = document.getElementById('folderTree');
      tree.removeEventListener('select', pub.closeNote);
      tree.removeEventListener('select', pub.updateXNoteButton);
      tree = document.getElementById('threadTree');
      tree.removeEventListener('contextmenu', pub.messageListClicked);
      tree.removeEventListener('select', pub.updateXNoteButton);
      tree.removeEventListener('mouseover', pub.getCurrentRow);
      tree.removeEventListener('select', xnote.ns.Overlay.initialise);


      let messagePane = document.getElementById("messagepane");
      messagePane.removeEventListener("contextmenu", pub.messagePaneClicked);
      tree = GetThreadTree();
      if (tree) {
        tree.removeEventListener('click', pub.getCurrentRow);

      }

    }
    catch (e) {
      logException(e, false);
    }



  }


  return pub;
}();

/*function toOpenWindowByType(inType, uri) {
  var winopts = "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar";
  window.open(uri, "_blank", winopts);
}
start_venkman();*/

//addEventListener('load', xnote.ns.Overlay.onLoad, true);

// dump("xnote: overlay - end: "+JSON.stringify(xnote, null, 2));

