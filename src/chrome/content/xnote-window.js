// encoding='UTF-8'

/*
	# File : xnote-window.xul
	# Authors : Hugo Smadja, Lorenz Froihofer
	# Description : Functions associated with the XNote window (xnote-window.xul).
*/

const { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
const extension = ExtensionParent.GlobalManager.getExtension("xnote@froihofer.net");
var {xnote} = ChromeUtils.import(extension.rootURI.resolve("chrome/modules/xnote.jsm"));
if (!xnote.ns) xnote.ns = {};
ChromeUtils.import(extension.rootURI.resolve("chrome/modules/commons.jsm"), xnote.ns);
ChromeUtils.import(extension.rootURI.resolve("chrome/modules/dateformat.jsm"), xnote.ns);

xnote.ns.Window = function() {
  // Variables for window movement
  var xBeforeMove, yBeforeMove;
  // Variables for window resizing.
  var widthBeforeMove, heightBeforeMove;
  
  var oldOpenerX, oldOpenerY;

  /** Displayed note. */
  var note;

  // result
  var pub = {};

  /**
   * APPELANT
   * type	: évènement load de l'élément XUL <window>
   * id	: xnote-window
   * FONCTION
   * Exécutée au chargement du post-it avant qu'elle ne soit affichée à l'écran.
   * C'est ici, que l'on peut modifier le style de la fenêtre dynamiquement
   */
  pub.onLoad = function (e) {
    //~ dump('\n->onLoad');
    // premet l'accès au préférences
    /*try
    {
      self.document.getElementById('xnote-note').style.setProperty('-moz-opacity', pref.getIntPref('xnote.transparence')/10, '');
    }
    catch(e) {}*/
    note = self.arguments[0];

    let texte=self.document.getElementById('xnote-texte');
    texte.value=note.text;

    //set date in the titlebar
    let modificationdate=self.document.getElementById("xnote-mdate");
    modificationdate.value=note.modificationDate;

    self.setTimeout(xnote.ns.Window.resizeWindow);

    if (window.arguments[1]=='clicBouton')
      texte.focus();
    else
      self.setTimeout(window.opener.focus);
  //~ dump('\n<-onLoad');
  }

  function resizeWindow (width, height) {
    width = width < 58 ?  58 : width;
    //Consider background image for height because of textarea.
    height = height < 130 ?  130 : height;
    //~ dump('\nwidth='+width+', height='+height);
    window.resizeTo(width, height);
    document.getElementById("xnote-texte").style.height = (height - 40) + "px";
  }

  pub.resizeWindow = function () {
    resizeWindow(note.width, note.height);
  }

  /**
   * CALLING XUL
   * Type: blur event of the XUL element <window>
   * Id: XNote-window
   * FUNCTION
   * Function called when the window loses focus. It assigns a
   * tag to the selected mail if the note contains text.
   */
  pub.updateTag = function () {
    //~ dump('\n->updateTag');
    opener.xnote.ns.Overlay.updateTag(document.getElementById('xnote-texte').value);
  //~ dump('\n<-updateTag');
  }

  /**
   * CALLER XUL
   * Type: unload event in XUL element <window>
   * Id: XNote-window
   * FUNCTION
   * Saves the note: location, size and content of the note,
   * A blank note will be deleted.
   */
  pub.saveNote = function () {
    let dateformat= xnote.ns.Commons.xnotePrefs.dateformat;
    let date = xnote.ns.DateFormat;
    let dateStr = date.format(dateformat);
    //~ dump('\n->saveNote');
    if (note.modified) {
      let oldText = note.text;
      note.text=document.getElementById('xnote-texte').value;
      if (note.text != '') {
        note.x=window.screenX-opener.screenX;
        note.y=window.screenY-opener.screenY;
        note.width=window.innerWidth;
        note.height=window.innerHeight;
        if (oldText != note.text) {
          note.modificationDate=dateStr;
        }
        note.saveNote();
      }
      else {
        note.deleteNote();
      }
    }
//  ~ dump('\n<-saveNote');
  }


  /**
   * CALLER XUL
   * Type: event input from XUL element <html:input>
   * Id: text
   * FUNCTION
   * Notification that the note was modified (edited, moved, ...).
   */
  pub.noteModified = function () {
    //~ dump('\n->modifierNote');
    note.modified = true;
  //~ dump('\n<-modifierNote');
  }

  /**
   * CALLER XUL
   * Type: event input from XUL element <html:input>
   * Id: text
   * FUNCTION
   * Change the set the note to be modified the note to be deleted when
   * the save method is called.
   */
  pub.deleteNote = function () {
    //~ dump('\n->supprimerNote');
    document.getElementById('xnote-texte').value='';
    pub.noteModified();
    pub.saveNote();
  //~ dump('\n<-supprimerNote');
  }

  /**
   * APPELANT XUL
   * type	: évènement mousedown de l'élément XUL <html:input>
   * id	: redim
   * FONCTION
   * Quand le bouton de la souris est enfoncé, sauve la taille et
   * lance la capture des évènements de déplacement et de relâchement
   */
  pub.startRedimensionnement = function (e) {
    if (e.button==0) {
      xBeforeMove = e.screenX;
      widthBeforeMove = window.innerWidth;
      yBeforeMove = e.screenY;
      heightBeforeMove = window.innerHeight;
      //~ dump('\n xBeforeMove='+xBeforeMove+' ; yBeforeMove='+yBeforeMove);
      //~ dump('\n heightBeforeMove='+heightBeforeMove+' ; heightBeforeMove='+heightBeforeMove);
      document.addEventListener('mousemove', xnote.ns.Window.redimenssionnement, true);
      document.addEventListener('mouseup', xnote.ns.Window.stopRedimenssionnement, true);
    }
  }

  /**
   * lors du déplacement de la souris, redimensionne la fenêtre grâce à la taille
   * enregistrée lors du clic.
   */
  pub.redimenssionnement = function (e) {
    //~ dump('\n w.document.width='+window.document.width+' ; w.document.height='+window.document.height);

    //~ dump('\nlargeur='+document.getElementById('xnote-texte').style.width);
    let newWidth = widthBeforeMove + e.screenX - xBeforeMove;
    let newHeight = heightBeforeMove + e.screenY - yBeforeMove;
    //~ dump('\nxAvantDeplacement='+xBeforeMove+', yAvantDeplacement='+yBeforeMove);
    //~ dump('\ne.screenX='+e.screenX+', e.screenY='+e.screenY);
    resizeWindow(newWidth, newHeight);
    pub.noteModified();
  }

  /**
   * quand le bouton de la souris est relaché, on supprime la capture
   * du déplacement de la souris.
   */
  pub.stopRedimenssionnement = function (e) {
    document.removeEventListener('mousemove', xnote.ns.Window.redimenssionnement, true);
    document.removeEventListener('mouseup', xnote.ns.Window.stopRedimenssionnement, true);
    let texte=document.getElementById('xnote-texte');
    texte.focus();
  }

  pub.checkOpenerMoved = function() {
    if (oldOpenerX != opener.screenX || oldOpenerY != opener.screenY) {
      window.moveTo(opener.screenX + note.x, opener.screenY + note.y)
      oldOpenerX = opener.screenX;
      oldOpenerY = opener.screenY;
    }
  }

  pub.onUnload = function(e) {
//    ~dump("\n->onUnload");
    pub.saveNote();
  }

  pub.onOpenerUnload = function(e) {
    pub.saveNote();
  }

  return pub;
}();

// Capture the Window focus lost event to update the XNote tag.
addEventListener('blur', xnote.ns.Window.updateTag, true);
addEventListener('load', xnote.ns.Window.onLoad, false);
addEventListener('unload', xnote.ns.Window.onUnload, false);

//For testing purposes
//addEventListener('DOMAttrModified', xnote.ns.Commons.printEventDomAttrModified, false);

//Necessary for correct shutdown as we are otherwise unable to correctly
//save a modified note
opener.addEventListener("unload", xnote.ns.Window.onOpenerUnload, false);
//Unfortunately, there seems to be no better way to react on window
//movement.
setInterval(xnote.ns.Window.checkOpenerMoved, 500);
