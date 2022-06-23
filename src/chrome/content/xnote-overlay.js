// encoding ='UTF-8'

/*
  # File : xnote-overlay.js
  # Author : Hugo Smadja, Pierre-Andre Galmes, Lorenz Froihofer, Klaus Buecher
  # Description : functions associated to the "xnote-overlay.xul" overlay file.
*/

/* 
 This overlay only deals with the context menu entries and should be replaced by
 menus API in background entirely.

 When a context menu entry closes a note window, it does not update xnote_displayed,
 so when this moves into background it should be more simple
 
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

var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { xnote } = ChromeUtils.import("resource://xnote/modules/xnote.jsm");

var xnoteOverlayObj = function () {
  var pub = {};

  // Variables related to the XNote context menu.
  var noteForContextMenu;
  var currentIndex;

  /** Contains the note for the current message */
  // This state variable is used by the Experiment, if this file goes away, the state could move into
  // a window map stored in the Experiment.
  var note;

  /** Contains the XNote window instance. */
  // This state variable is used by the Experiment, if this file goes away, the state could move into
  // a window map stored in the Experiment.
  var xnoteWindow;

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
    if (gDBView.selection.currentIndex == currentIndex) {
      //Closes the note (if any) of the old (deselected) message.
      pub.closeNote();

      //Initialize note for the newly selected message.
      note = new xnote.ns.Note(pub.getMessageID());
      pub.updateTag(note.text);

      xnoteWindow = window.openDialog(
        'chrome://xnote/content/xnote-window.xhtml',
        'XNote',
        'chrome=yes,dependent=yes,resizable=yes,modal=no,left=' + (window.screenX + note.x) + ',top=' + (window.screenY + note.y) + ',width=' + note.width + ',height=' + note.height,
        note, true
      );
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
    pub.closeNote();
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
    }
  }

  function updateContextMenu() {
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
    if (e.button == 2) {
      updateContextMenu();
    }
    let t = e.originalTarget;
    if (t.localName == 'treechildren') {
      let tree = GetThreadTree();
      let treeCellInfo = tree.getCellAt(e.clientX, e.clientY);
      currentIndex = treeCellInfo.row;
    }
  }

  pub.getCurrentRow = function (e) {
    let t = e.originalTarget;
    if (t.localName == 'treechildren') {
      let tree = GetThreadTree();
      let treeCellInfo = tree.getCellAt(e.clientX, e.clientY);
      currentIndex = treeCellInfo.row;
    }
  }


  pub.messagePaneClicked = function (e) {
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
   * At each boot of the extension, associate events such as selection of mails,
   * files, or right click on the list of messages. On selection show the associated
   * note.
   */
  pub.onLoad = function (e) {
    try {
      let tree = document.getElementById('threadTree');
      tree.addEventListener('contextmenu', pub.messageListClicked, false);
      tree.addEventListener('mouseover', pub.getCurrentRow, false);

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
  }

  pub.onUnload = function (e) {
    try {
      let tree = document.getElementById('threadTree');
      tree.removeEventListener('contextmenu', pub.messageListClicked);
      tree.removeEventListener('mouseover', pub.getCurrentRow);

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
