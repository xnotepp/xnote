// encoding ='UTF-8'

/**
	# File : xnote-overlay.xul
	# Author : Hugo Smadja, Pierre-Andre Galmes
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
var noteApresCliqueDroit;
var currentIndex;

// variable stockant l'instance de la fenêtre (post-it).
// Global variables containing the window instance (post-it).
var w;

/* permet de savoir si le post-it a été ouvert à la demande de l'utilisateur ou
   automatiquement lors de la sélection d'un mail afain de donner ou non le focus au post-it
*/
var gEvenement;

/** 
 * APPELANT XUL
 * type	: évènement load de l'élément XUL <toolbarbutton>
 * id	: button-xnote
 * FONCTION
 * exécutée au chargement du post-it avant qu'elle ne soit affichée à l'écran. 
 * C'est ici, que l'on peut modifier le style de la fenêtre dynamiquement
 */
function initialise(evenement)
{

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

	fermerNote();
	var note = new Note(getFichierNote());
	
	surligner( note.contenu );

	var bundle = document.getElementById('string-bundle');
	
	
	//~ dump('\nevenement = '+evenement);
	if (evenement)
	{
		//~ dump('\nevenement=true');
		gEvenement = evenement;
	}
	if (note.contenu != '' || gEvenement=='clicBouton')
	{
		w = window.openDialog
			(
				'chrome://xnote/content/xnote-window.xul',
				'XNote',
				'chrome=yes,dependent=yes,resizable=yes,modal=no,left='+note.x+',top='+note.y+',width='+note.largeur+',height='+note.hauteur,
				note, gEvenement
			);
	}
	gEvenement = '';
	//~ dump('\n<-initialise');
}

/** 
 * APPELANT XUL
 * type	: évènement command de l'élément XUL <menuitem>
 * id	: context-ajout
 * FONCTION
 * La création et la modification de note utilise la même fonction. C'est pourquoi
 * cette fonction appelle la fonction context_modifierNote.
 */
/**
 * Creation and modification of notes uses the same function, that is context_modifierNote() 
 */
function context_ajouterNote()
{
	context_modifierNote();
}

/** 
 * APPELANT XUL
 * type	: évènement command de l'élément XUL <menuitem>
 * id	: context-modif
 * FONCTION
 * Le problème du clic droit sur un autre mail que celui sélectionné est qu'après que le
 * menu contextuel a disparu, le mail sélectionné avant le clic droit est à nouveau sélectionné.
 * Ainsi, la création de la note ne se fera pas sur le bon mail. Pour éviter cela, à la sortie 
 * du menu contextuel, le mail sur lequel un clic droit a été effectué est sélectionné.
 */
function context_modifierNote()
{
	gEvenement = 'clicBouton';	//spécifie que le post-it va être affiché par l'utilisateur
	var view = GetDBView();
	if (view.selection.currentIndex==currentIndex)	
	{		//si on clic droit sur le mail courant (celui sélectionné)
		initialise();
	}
	else	
	{
		view.selection.currentIndex = currentIndex;
		view.selectionChanged();
	}
}

/** 
 * APPELANT XUL
 * type	: évènement command de l'élément XUL <menuitem>
 * id	: context-suppr
 * FONCTION
 * Supprime la note associé au mail cliqué droit.
 */
function context_supprimerNote()
{
	noteApresCliqueDroit.supprimer();
	setTimeout("initialise('')");
}

/** 
 * FONCTION
 * Si le post-it est affiché, on le ferme
 */
function fermerNote()
{
	if (w != null && w.document)
	{
		w.close();
	}
}

/** 
 * FONCTION
 * Applique au mail sélectionné l'étiquette associée aux notes
 * (choix possible de cette étiquette dans les préférences)
 */
function surligner( contenu )
{
	// dump('\n->surligner');

    // alert( "Etiquette courante" );



   
    

	var uri = getMessageURI();
	var header = messenger.msgHdrFromURI( uri );

	//whether to use tags or not
	if(useTag == 1)
	{    
    	var tagService = Components.classes["@mozilla.org/messenger/tagservice;1"]
        .getService(Components.interfaces.nsIMsgTagService);

    	var key = tagService.getKeyForTag( XNOTE_TAG_NAME ); 


	    // If the note isn't empty,
		if( contenu != '' )
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
		//~ dump('\n<-surligner');
	}
}

/** 
 * FONCTION
 * lors du clique droit : - Instancie un objet note à partir du mail sur lequel est effectué le clic droit
 * 						  - si la note instanciée est dans un fichier du disque, alors on grise la fontion
							d'ajout de note du menu contextuel, sinon, on grise les fonctions de modification
							et de suppression
 */
function cliqueMail(e)
{
	//~ dump('\n->cliqueMail');
	if (e.button==2)
	{
		noteApresCliqueDroit = new Note(getFichierNote());
		var leFichierExiste = noteApresCliqueDroit.fichier.exists();
		document.getElementById('context-ajout').setAttribute('disabled', leFichierExiste);
		document.getElementById('context-modif').setAttribute('disabled', !leFichierExiste);
		var t = e.originalTarget;
		if (t.localName == 'treechildren')
		{
			var row = new Object;
			var col = new Object;
			var childElt = new Object;

			var tree = GetThreadTree();
			tree.treeBoxObject.getCellAt(e.clientX, e.clientY, row, col, childElt);
			currentIndex = row.value;
			//~ dump('\nrow.value = '+row.value);
		}
	}
	//~ dump('\n<-cliqueMail');
}

/**
 * initialise les variables d'environnement liées au système d'exploitation
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
 * Récupère le fichier de note associée au mail sélectionné. Si le mail possède une note alors le fichier existe
 * et la fonction renvoie un descripteur de ce fichier. Sinon, elle renvoie null.
 */
function getFichierNote()
{
	initEnv();
	var fichierNote =	Components.classes['@mozilla.org/file/local;1']
						.createInstance(Components.interfaces.nsILocalFile);
	//~ dump('\n'+getCheminDossierNote()+'\n'+messageID);
	fichierNote.initWithPath(getCheminDossierNote()+getMessageID()+'.xnote');
	return fichierNote;
	//~ dump('\n'+getCheminDossierNote()+messageID+'.xnote');
}

/**
 * Récupère le chemin d'accès du dossier où sont stockées les notes
 */
function getCheminDossierNote()
{
	var serviceDossier = 	Components.classes['@mozilla.org/file/directory_service;1']
							.getService(Components.interfaces.nsIProperties);
	var dossierProfile = serviceDossier.get('ProfD', Components.interfaces.nsIFile);
	return dossierProfile.path + separateur + 'XNote' + separateur;
}

/**
 * récupère le message-id du mail sélectionné.
 */
/**
 * get message id from selected message
 * 
 */
function getMessageID()
{
	var uri = getMessageURI();
	if (uri!=null)
	{
		var header = messenger.msgHdrFromURI(uri);
		var messageID = header.messageId;
		return messageID;
	}
	else
	{
		return null;
	}
}

/**
 * récupère le(s) uri(s) du(es) mail(s) sélectionné(s). et désactive le bouton XNote
 * de la barre d'outils si 0 et plusieurs mails sont sélectionnés.
 */
/**
 * get uris from selected mails, disable Xnote button if no mails are selected
 */
function getMessageURI()
{
	var messageArray = {};
	messageArray = GetSelectedMessages();
	var bouton = document.getElementById('button-xnote');
	if (messageArray && messageArray.length==1)
	{
		if (bouton)
			bouton.setAttribute('disabled', false);
		document.getElementById('threadPaneContext-xNote').setAttribute('disabled', false);
		return messageArray[0];
	}
	else
	{
		if (bouton)
			bouton.setAttribute('disabled', true);
		document.getElementById('threadPaneContext-xNote').setAttribute('disabled', true);
		fermerNote();
		return null;
	}
}

/**
 * Cette fontion, exécutée au premier démarrage de après l'installation de l'extension, ajoute
 * l'icône XNote à la fin de la barre d'outils.
 */
function premierLancement()
{
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
 * A chaque démarrage de l'extension, on associe des évènements à la sélection de mails, de dossiers
 * ou au click droit sur la liste des mails. Ainsi, si un mail est sélectionné, il sera possible d'afficher
 * la note qui lui est associée.
 */
/**
 * At each boot of the extension, associate events such as selection of mails, dossiers?, or right click on mails to stuff. On selection show note
 * 
 */
function onLoad(e)
{
	if (String(EnsureSubjectValue).search('extensionDejaChargee')==-1)
	{
		var oldEnsureSubjectValue=EnsureSubjectValue;
		EnsureSubjectValue=function(){var extensionDejaChargee ; oldEnsureSubjectValue(); setTimeout("initialise('')");};
	}
	try
	{
		var tree = document.getElementById('folderTree');
		tree.addEventListener('select', fermerNote, false);
		var tree = document.getElementById('threadTree');
		tree.addEventListener('click', cliqueMail, false);
		var tree = document.getElementById('threadTree');
		tree.addEventListener('select', getMessageURI, false);
	}
	catch(e){}
	premierLancement();
}

addEventListener('load', onLoad, true);
