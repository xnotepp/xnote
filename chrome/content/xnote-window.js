// encoding='UTF-8'

/**
	# Fichier : xnote-window.xul
	# Auteur : Hugo Smadja
	# Description : fonctions associées à la fenêtre du fichier xnote-window.xul
*/

// variables nécessaires au déplacement du post-it
var xAvantDeplacement, yAvantDeplacement;
// variables nécessaires au redimensionnement du post-it
var largeurAvantDeplacement, hauteurAvantDeplacement;


/** 
 * APPELANT
 * type	: évènement load de l'élément XUL <window>
 * id	: xnote-window
 * FONCTION
 * Exécutée au chargement du post-it avant qu'elle ne soit affichée à l'écran. 
 * C'est ici, que l'on peut modifier le style de la fenêtre dynamiquement
 */
function onLoad()
{
  //~ dump('\n->onLoad');
  // premet l'accès au préférences
  /*var pref = 	Components.classes['@mozilla.org/preferences-service;1']
				.getService(Components.interfaces.nsIPrefService);
	try
	{
		self.document.getElementById('note').style.setProperty('-moz-opacity', pref.getIntPref('xnote.transparence')/10, '');
	}
	catch(e) {}*/
  var texte=self.document.getElementById('texte');
  texte.value=self.arguments[0].text;
	
	
  //set date in the titlebar
  var modificationdate=self.document.getElementById("mdate");
	
  modificationdate.value=self.arguments[0].modDate;
	
	
		
  self.setTimeout('window.resizeTo(window.arguments[0].width,window.arguments[0].height);');
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
function updateTag()
{
  //~ dump('\n->updateTag');
  opener.updateTag(document.getElementById('texte').value);
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
function saveNote() {
  //Initialise prefs
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefBranch);
  var dateformat= prefs.getCharPref("xnote.dateformat");
  var date1 = date.format(dateformat);
  //~ dump('\n->sauvegarderNote');
  var note=window.arguments[0];
  if (note.isModified())
  {
    note.text=document.getElementById('texte').value;
    if (note.text!='')
    {
      note.x=window.screenX;
      note.y=window.screenY;
      note.width=window.document.width;
      note.height=window.document.height;
      note.modificationDate=date1;
      note.saveNote();
    }
    else
    {
      note.deleteNote();
    }
  }
//~ dump('\n<-sauvegarderNote');
}


/** 
 * CALLER XUL
 * Type: event input from XUL element <textbox>
 * Id: text
 * FUNCTION
 * Notification that the note was modified (edited, moved, ...).
 */
function noteModified()
{
  //~ dump('\n->modifierNote');
  window.arguments[0].setModified(true);
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
function deleteNote()
{
  //~ dump('\n->supprimerNote');
  document.getElementById('texte').value='';
  noteModified();
  saveNote();
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
function startRedimensionnement(e)
{
  if (e.button==0)
  {
    xAvantDeplacement = e.screenX;
    largeurAvantDeplacement = window.document.width;
    yAvantDeplacement = e.screenY;
    hauteurAvantDeplacement = window.document.height;
    //~ dump('\n xAvantDeplacement='+xAvantDeplacement+' ; yAvantDeplacement='+yAvantDeplacement);
    document.addEventListener('mousemove', redimenssionnement, true);
    document.addEventListener('mouseup', stopRedimenssionnement, true);
  }
}

/**
 * lors du déplacement de la souris, redimensionne la fenêtre grâce à la taille
 * enregistrée lors du clic.
 */
function redimenssionnement(e)
{
  //~ dump('\n w.document.width='+window.document.width+' ; w.document.height='+window.document.height);
	
  //~ dump('\nlargeur='+document.getElementById('texte').style.width);
  var nouvelleLargeur = largeurAvantDeplacement + e.screenX - xAvantDeplacement;
  var nouvelleHauteur = hauteurAvantDeplacement + e.screenY - yAvantDeplacement;
  nouvelleLargeur = nouvelleLargeur< 58 ?  58 : nouvelleLargeur;
  nouvelleHauteur = nouvelleHauteur< 88 ?  88 : nouvelleHauteur;
  window.resizeTo(nouvelleLargeur,nouvelleHauteur);
  noteModified();
}

/** 
 * quand le bouton de la souris est relaché, on supprime la capture
 * du déplacement de la souris.
 */
function stopRedimenssionnement(e)
{
  document.removeEventListener('mousemove', redimenssionnement, true);
  document.removeEventListener('mouseup', stopRedimenssionnement, true);
  var texte=self.document.getElementById('texte');
  texte.focus();
}

/**
 * Captures the event of the focus loss of the window to update the
 * XNote tag.
 */
addEventListener('blur', updateTag, true);