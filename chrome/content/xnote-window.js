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
	texte.value=self.arguments[0].contenu;
	
	
	//set date in the titlebar
	var modificationdate=self.document.getElementById("mdate");
	
	modificationdate.value=self.arguments[0].modDate;
	
	
		
	self.setTimeout('window.resizeTo(window.arguments[0].largeur,window.arguments[0].hauteur);');
	//~ self.setTimeout("document.getElementById('xnote-window').style.setProperty('visibility','visible','')");
	//~ self.setTimeout("document.getElementById('xnote-window').setAttribute('background-color', 'black')");

	if (window.arguments[1]=='clicBouton')
		texte.focus();
	else
		self.setTimeout('window.opener.focus();');
	//~ dump('\n<-onLoad');
}

/** 
 * APPELANT XUL
 * type	: évènement blur de l'élément XUL <window>
 * id	: xnote-window
 * FONCTION
 * fonction appelée dès que la fenêtre perd le focus. Elle permet d'attribuer une
 * étiquette au mail sélectionné si la note contient du texte.
 */
function surligner()
{
	//~ dump('\n->surligner');
	opener.surligner(document.getElementById('texte').value);
	//~ dump('\n<-surligner');
}

/** 
 * APPELANT XUL
 * type	: évènement unload de l'élément XUL <window>
 * id	: xnote-window
 * FONCTION
 * Sauvegarde la note, c'est-à-dire : la position, la taille et le contenu du post-it,
 * en utilisant la méthode sauver de l'objet Note. Une note vide sera supprimée.
 */
function sauvegarderNote()
{
		//Initialise prefs
  	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);
	var dateformat= prefs.getCharPref("xnote.dateformat");
		var date1 = date.format(dateformat);
	//~ dump('\n->sauvegarderNote');
	var note=window.arguments[0];
	if (note.modification)
	{
		note.contenu=document.getElementById('texte').value;
		if (note.contenu!='')
		{
			note.x=window.screenX;
			note.y=window.screenY;
			note.largeur=window.document.width;
			note.hauteur=window.document.height;
			note.modificationDate=date1;
			note.sauver();
		}
		else
		{
			note.supprimer();
		}
	}
	//~ dump('\n<-sauvegarderNote');
}


/** 
 * APPELANT XUL
 * type	: évènement input de l'élément XUL <textbox>
 * id	: texte
 * FONCTION
 * Change la variable modification de la note pour que l'enregistrement soit effectué
 * lorsque la méthode sauver est appelée.
 */
function modifierNote()
{
	//~ dump('\n->modifierNote');
	window.arguments[0].modification=true;
	//~ dump('\n<-modifierNote');
}

/** 
 * APPELANT XUL
 * type	: évènement command de l'élément XUL <image>
 * id	: bouton-suppr
 * FONCTION
 * Supprime la contenu du post et appelle la méthode sauvegarder. Celle-ci supprimant
 * les notes vides, la note est bien supprimée.
 */
function supprimerNote()
{
	//~ dump('\n->supprimerNote');
	document.getElementById('texte').value='';
	modifierNote();
	sauvegarderNote();
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
	modifierNote();
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
 * permet de capter l'évènement de perte de focus la fenêtre et d'accosier
 * cet évèvement à l'attribution d'une étiquette au mail courant.
 */
addEventListener('blur', surligner, true);