// encoding='UTF-8'

/*
	# File : xnote-window.xul
	# Authors : Hugo Smadja, Lorenz Froihofer
	# Description : fonctions associées à la fenêtre du fichier xnote-window.xul
*/

if (!net) var net = {};
if (!net.froihofer) net.froihofer={};
if (!net.froihofer.xnote) net.froihofer.xnote={};

net.froihofer.xnote.Window = function() {
  // variables nécessaires au déplacement du post-it
  var xAvantDeplacement, yAvantDeplacement;
  // variables nécessaires au redimensionnement du post-it
  var largeurAvantDeplacement, hauteurAvantDeplacement;

  var note;

  // result
  var pub = function(){};

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
    /*var pref = 	Components.classes['@mozilla.org/preferences-service;1']
          .getService(Components.interfaces.nsIPrefService);
    try
    {
      self.document.getElementById('note').style.setProperty('-moz-opacity', pref.getIntPref('xnote.transparence')/10, '');
    }
    catch(e) {}*/
    note = self.arguments[0];

    var texte=self.document.getElementById('texte');
    texte.value=note.text;

    //set date in the titlebar
    var modificationdate=self.document.getElementById("mdate");
    modificationdate.value=note.modificationDate;

    self.setTimeout('window.resizeTo('+note.width+','+note.height+');');
    //~ self.setTimeout("document.getElementById('xnote-window').style.setProperty('visibility','visible','')");
    //~ self.setTimeout("document.getElementById('xnote-window').setAttribute('background-color', 'black')");

    if (window.arguments[1]=='clicBouton')
      texte.focus();
    else
      self.setTimeout('window.opener.focus();');
  //~ dump('\n<-onLoad');
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
    opener.net.froihofer.xnote.Overlay.updateTag(document.getElementById('texte').value);
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
    //Initialise prefs
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                      getService(Components.interfaces.nsIPrefBranch);
    var dateformat= prefs.getCharPref("xnote.dateformat");
    var date = net.froihofer.xnote.Date;
    var date1 = date.format(dateformat);
    //~ dump('\n->saveNote');
    if (note.isModified()) {
      note.text=document.getElementById('texte').value;
      if (note.text!='') {
        note.x=window.screenX-opener.screenX;
        note.y=window.screenY-opener.screenY;
        note.width=window.document.width;
        note.height=window.document.height;
        note.modificationDate=date1;
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
   * Type: event input from XUL element <textbox>
   * Id: text
   * FUNCTION
   * Notification that the note was modified (edited, moved, ...).
   */
  pub.noteModified = function () {
    //~ dump('\n->modifierNote');
    note.setModified(true);
  //~ dump('\n<-modifierNote');
  }

  /**
   * CALLER XUL
   * Type: event input from XUL element <textbox>
   * Id: text
   * FUNCTION
   * Change the set the note to be modified the note to be deleted when
   * the save method is called.
   */
  pub.deleteNote = function () {
    //~ dump('\n->supprimerNote');
    document.getElementById('texte').value='';
    pub.noteModified();
    pub.saveNote();
  //~ dump('\n<-supprimerNote');
  }

  /**
   * APPELANT XUL
   * type	: évènement mousedown de l'élément XUL <textbox>
   * id	: redim
   * FONCTION
   * Quand le bouton de la souris est enfoncé, sauve la taille et
   * lance la capture des évènements de déplacement et de relâchement
   */
  pub.startRedimensionnement = function (e) {
    if (e.button==0) {
      xAvantDeplacement = e.screenX;
      largeurAvantDeplacement = window.document.width;
      yAvantDeplacement = e.screenY;
      hauteurAvantDeplacement = window.document.height;
      //~ dump('\n xAvantDeplacement='+xAvantDeplacement+' ; yAvantDeplacement='+yAvantDeplacement);
      document.addEventListener('mousemove', net.froihofer.xnote.Window.redimenssionnement, true);
      document.addEventListener('mouseup', net.froihofer.xnote.Window.stopRedimenssionnement, true);
    }
  }

  /**
   * lors du déplacement de la souris, redimensionne la fenêtre grâce à la taille
   * enregistrée lors du clic.
   */
  pub.redimenssionnement = function (e) {
    //~ dump('\n w.document.width='+window.document.width+' ; w.document.height='+window.document.height);

    //~ dump('\nlargeur='+document.getElementById('texte').style.width);
    var nouvelleLargeur = largeurAvantDeplacement + e.screenX - xAvantDeplacement;
    var nouvelleHauteur = hauteurAvantDeplacement + e.screenY - yAvantDeplacement;
    nouvelleLargeur = nouvelleLargeur< 58 ?  58 : nouvelleLargeur;
    nouvelleHauteur = nouvelleHauteur< 88 ?  88 : nouvelleHauteur;
    window.resizeTo(nouvelleLargeur,nouvelleHauteur);
    pub.noteModified();
  }

  /**
   * quand le bouton de la souris est relaché, on supprime la capture
   * du déplacement de la souris.
   */
  pub.stopRedimenssionnement = function (e) {
    document.removeEventListener('mousemove', net.froihofer.xnote.Window.redimenssionnement, true);
    document.removeEventListener('mouseup', net.froihofer.xnote.Window.stopRedimenssionnement, true);
    var texte=self.document.getElementById('texte');
    texte.focus();
  }

  pub.openerDOMAttrModified = function(e) {
    if (e.attrName != "screenX" && e.attrName != "screenY" && e.attrName != "sizemode") return;

    //~dump("modified: "+e.attrName+", node="+e.relatedNode.nodeName+", node.ownerElement="+e.relatedNode.ownerElement+"\n");
    //~for (var i in e.relatedNode.ownerElement) dump(i+"\n");
    //~dump("\n");
    window.moveTo(opener.screenX + note.x, opener.screenY + note.y)
  }

  pub.onUnload = function(e) {
//    ~dump("\n->onUnload");
    pub.saveNote();
    opener.removeEventListener('DOMAttrModified', net.froihofer.xnote.Window.openerDOMAttrModified, false);
  }

  pub.onOpenerUnload = function(e) {
    pub.saveNote();
    opener.removeEventListener("DOMAttrModified", net.froihofer.xnote.Window.openerDOMAttrModified, useCapture)
  }

  return pub;
}();

// Capture the Window focus lost event to update the XNote tag.
addEventListener('blur', net.froihofer.xnote.Window.updateTag, true);
addEventListener('load', net.froihofer.xnote.Window.onLoad, false);
addEventListener('unload', net.froihofer.xnote.Window.onUnload, false);
//Necessary for correct shutdown as we are otherwise unable to correctly
//save a modified note
opener.addEventListener("unload", net.froihofer.xnote.Window.onOpenerUnload, false);
//Unfortunately, there seems to be no better way to react on window
//movement.
opener.addEventListener('DOMAttrModified', net.froihofer.xnote.Window.openerDOMAttrModified, false);