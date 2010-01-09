// encoding="UTF-8"

//~ dump('\nInitialisation des variables globales');

	// variables nécessaires au déplacement du post-it
var xAvantDeplacement, yAvantDeplacement, widthAvantDeplacement, heightAvantDeplacement;
var enDeplacement;

	// variables d'environnement concernant les chemins d'accès aux fichiers
var CR='';
var CRLen=0;
var separateur='/';

	// stocke la position et la taille du post-it
var x = 0, y = 0, width=0, height=0;
	// stocke le contenu de la note en elle-même
var contenu = '';
	// booléan précisant si une note a été modifiée (x, y ou contenu) en vue d'une sauvegarde
var modification;
	// fichier dans lequel est sauvegarder la note et sa position.
var fichierNote = null;
	// la fenêtre
var w = null;
var evenementSource;
var currentMessageURI;
/**
 * Affiche la fenêtre de post-it
 */
function afficherNote()
{
	//~ dump("\nafficherNote("+x+","+y+")");
	w=window.openDialog
		(
			"chrome://xnote/content/xnote.xul",
			"XNote",
			"chrome,dependent,left="+x+",top="+y,
			fichierNote
		);
	//~ +",width="+width+",height="+height
	w.onload=initUI;
	/*
	var txt=document.getElementById("texte");
	txt.setAttribute("value","Salut tout le monde ! ! !");*/
}

/**
 * 
 */
function initUI()
{
	// premet l'accès au préférences
	
	var pref = 	Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);
	try
	{
		w.document.getElementById("note").style.setProperty("-moz-opacity", pref.getIntPref("xnote.transparence")/10, "");
	}
	catch(e) {}
	/* var canvas=w.document.getElementById("cadreSVG");
	var context = canvas.getContext("2d");
	context.lineJoin = "round";
	context.strokeStyle = "#FFFF99";
	context.lineWidth = 6;
	context.strokeRect(0,0,200,200);
	context.fillStyle = "#FFFF99";
	context.fillRect(0,0,200,200);
	context.save(); */
	var texte=w.document.getElementById("texte");
	
 	texte.width=width-11;
	texte.height=height-59;
	texte.value=contenu;
	
	texte.focus();
	if (evenementSource!='clicBouton')
		w.setTimeout("window.opener.focus();");
	w.setTimeout("modifierNote(false);");
	//~ if (evenementSource!=clicBouton)
		//~ w.setTimeout("window.opener.focus();");
	//~ var tree = GetThreadTree();
	//~ tree.focus();
}

function initialise(evenement)
{
	//~ dump("\nbouton : "+evenement.button);
	if (w && w.window)
	{
		sauverNote();
		w.close();
	}
	initFichierNote();
	if (fichierNote.exists())
	{
		lireNote();
		document.getElementById('context-suppr').setAttribute("disabled", false);
	}
	else
	{
		contenu='';
		width=164;
		height=164;
		x=(window.screen.width-width)/2;
		y=(window.screen.height-height)/2;
		document.getElementById('context-suppr').setAttribute("disabled", true);
	}
	if (contenu!='' || evenement=="clicBouton")
	{
		evenementSource=evenement;
		afficherNote();
	}
}

function initEnv()
{
	if (navigator.platform.toLowerCase().indexOf("win") != -1)
	{
		CR = '\r';
		CRLen = CR.length;
		separateur= '\\';
	}
}

/**
 * 
 */
function lireNote()
{
	var stream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
		var fileScriptableIO = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
			stream.init(fichierNote, 0x01, 0444, null );
			fileScriptableIO.init(stream);
			x=fileScriptableIO.read(4);
			y=fileScriptableIO.read(4);
			width=fileScriptableIO.read(4);
			height=fileScriptableIO.read(4);
			contenu = fileScriptableIO.read(fichierNote.fileSize-16);
		fileScriptableIO.close();
	stream.close();
	contenu=contenu.replace(/<BR>/g,"\n");
}

/**
 * Sauvegarde la note courante dans un fichier dont le nom est le message-id
 */
function sauverNote()
{
	//~ dump("\nmodification="+modification);
	if (!modification)
		return;
	//~ dump('\nsave');
	fichierNote=window.arguments[0];
	contenu=document.getElementById("texte").value;
	if (fichierNote.exists())
		fichierNote.remove(true);
	fichierNote.create(fichierNote.NORMAL_FILE_TYPE, 0600);
	contenu = contenu.replace(/\n/g,"<BR>");
	var stream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
	stream.init(fichierNote, 2, 0x200, false); // ouvre en écriture seule
	stream.write(window.screenX,4);
	stream.write(window.screenY,4);
	stream.write(window.document.width,4);
	stream.write(window.document.height,4);
	stream.write(contenu, contenu.length);
	stream.close();
	modifierNote(false);
	opener.goDoCommand('cmd_label4');
	//~ dump("x="+window.screenX+" ; y="+window.screenY+" ; "+contenu);
}

/**
 * Sauvegarde la note courante dans un fichier dont le nom est le message-id
 */
function supprimerNote(file)
{
	file.remove
	opener.goDoCommand('cmd_label0');
	opener.document.getElementById('context-suppr').setAttribute("disabled", true);
	document.getElementById('bouton-suppr').setAttribute("disabled", true);
	sauverNote();
}

function modifierNote(modif)
{
	if (modification!=modif)
	{
		modification=modif;
		if (modification)
		{
			opener.document.getElementById('context-suppr').setAttribute("disabled", false);
			document.getElementById('bouton-suppr').setAttribute("disabled", false);
		}
		else
		{
			if (document.getElementById('texte').value=='')
				document.getElementById('bouton-suppr').setAttribute("disabled", true);
		}
	}
}

/*
 * 
 */
function initFichierNote()
{
	initEnv();
	fichierNote =	Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
	//~ dump("\n"+getCheminDossierNote()+"\n"+messageID);
	fichierNote.initWithPath(getCheminDossierNote()+getMessageID()+".xnote");
	//~ dump("\n"+getCheminDossierNote()+messageID+".xnote");
}

/**
 * Récupère le chemin d'accès du fichier pour la note courante
 * Il est sous la forme [dossier de profile]/[message-id].txt
 */
function getCheminDossierNote()
{
	var serviceDossier = 	Components.classes["@mozilla.org/file/directory_service;1"]
							.getService(Components.interfaces.nsIProperties);
	var dossierProfile = serviceDossier.get("ProfD", Components.interfaces.nsIFile);
	return dossierProfile.path + separateur + "XNote" + separateur;
}

/**
 * récupère le message-id du mail sélectionné.
 */
function getMessageID()
{
	//~ var dbv = GetDBView()
	//~ messageID = dbv.hdrForFirstSelectedMessage.messageId;
	var uri = getMessageURI();
	if (uri!=null)
	{
		var header = messenger.msgHdrFromURI(uri);
		messageID = header.messageId;
		return messageID;
	}
	else
	{
		return null;
	}
}

/**
 * récupère le(s) uri(s) du(es) mail(s) sélectionné(s).
 */
function getMessageURI()
{
	var messageArray={};
	messageArray=GetSelectedMessages();
	if (messageArray && messageArray.length==1)
	{
		if (document.getElementById("button-xnote")) 
			document.getElementById("button-xnote").setAttribute("disabled", false);
		return messageArray[0];
	}
	else
	{
		if (document.getElementById("button-xnote")) 
			document.getElementById("button-xnote").setAttribute("disabled", true);
		return null;
	}
}

/**
 * Drag'n'Drop : quand le bouton de la souris est enfoncé, capture la position et
 *				 précise dans la variable enDeplacement que le bouton est enfoncé
 */
function startDeplacement(e)
{
	//~ dump("\nX="+e.clientX+" ; Y="+e.clientY);
	if (e.button==0)
	{
		xAvantDeplacement = window.screenX - e.screenX;
		yAvantDeplacement = window.screenY  - e.screenY;	
		document.addEventListener("mousemove", deplacement, true);
		document.addEventListener("mouseup", stopDeplacement, true);
		enDeplacement = true;
		//~ document.getElementById("texte").style.setProperty("-moz-opacity", 0.45, "");
	}
}

/**
 * Drag'n'Drop : lors du déplacement de la souris, déplace l'élément
 * 				 XUL si la variable enDeplacement est à true
 */
function deplacement(e)
{
	//~ dump("\n(X,Y)="+e.clientX+","+e.clientY);
	window.moveTo(e.screenX + xAvantDeplacement, e.screenY + yAvantDeplacement);
	modifierNote(true);
}

/**
 * Drag'n'Drop : quand le bouton de la souris est relaché, précise dans
 *				 la variable enDeplacement que le bouton est relaché
 */
function stopDeplacement(e)
{
	document.removeEventListener("mousemove", deplacement, true);
	document.removeEventListener("mouseup", stopDeplacement, true);
	enDeplacement = false;
	sauverNote();
	//~ pref =	Components.classes["@mozilla.org/preferences-service;1"]
			//~ .getService(Components.interfaces.nsIPrefService);
	//~ document.getElementById("texte").style.setProperty("-moz-opacity", 1.0, "");
}

/** 
 * 
 */
function startRedimensionnement(e)
{
	if (e.button==0)
	{
		xAvantDeplacement = e.screenX;
		widthAvantDeplacement = window.document.width;
		yAvantDeplacement = e.screenY;
		heightAvantDeplacement = window.document.height;
		//~ dump("\n xAvantDeplacement="+xAvantDeplacement+" ; yAvantDeplacement="+yAvantDeplacement);
		document.addEventListener("mousemove", redimenssionnement, true);
		document.addEventListener("mouseup", stopRedimenssionnement, true);
	}
}

/** 
 * 
 */
function stopRedimenssionnement(e)
{
	document.removeEventListener("mousemove", redimenssionnement, true);
	document.removeEventListener("mouseup", stopRedimenssionnement, true);
	enDeplacement = false;
	sauverNote();
}

/**
 * 
 */
function redimenssionnement(e)
{
	//~ dump("\n w.document.width="+window.document.width+" ; w.document.height="+window.document.height);
	
	//~ dump("\nwidth="+document.getElementById("texte").style.width);
	var newWidth = widthAvantDeplacement + e.screenX - xAvantDeplacement;
	var newHeight = heightAvantDeplacement + e.screenY - yAvantDeplacement;
	newWidth = newWidth<54 ? 54 : newWidth;
	newHeight = newHeight<84 ? 84 : newHeight;
	window.resizeTo(newWidth,newHeight);
	modifierNote(true);
}


function onLoad(e)
{
	if (String(EnsureSubjectValue).search("extensionDejaChargee")==-1)
	{
		var oldEnsureSubjectValue=EnsureSubjectValue;
		EnsureSubjectValue=function(){var extensionDejaChargee; oldEnsureSubjectValue(); initialise();};

		try
		{
			var tree = GetThreadTree();
			tree.addEventListener("click", function(e){if (e.button==2) currentMessageURI=getMessageURI();}, false);
		}
		catch(e){}
	}
}

addEventListener("load", onLoad, true);