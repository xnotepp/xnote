// encoding='UTF-8'

/**
	# Fichier : xnote-classe.xul
	# Auteur : Hugo Smadja
	# Description : classe Note permettant d'instancier des notes.
*/

	//valeur par défaut d'un objet Note
const LARGEUR=164;
const HAUTEUR=164;
const X=(window.screen.width-LARGEUR)/2;
const Y=(window.screen.height-HAUTEUR)/2;





/**
 * Constructeur de la classe Note. On contruit une Note à partir d'un descripteur de
 * fichier passé en argument. Si le fichier n'existe pas, la note est initialisée avec
 * les valeurs par défaut, sinon, elle est initialisée avec les contenu du fichier.
 */
function Note(file)
{
	//~ dump('\n->Note');

//variables
	this.fichier = file;		
	this.modification = false;
//méthodes
	this.charger = note_charger;
	this.sauver = note_sauver;
	this.supprimer = note_supprimer;
	this.toString = function(){ return ('\n'+this.x+' ; '+this.y+' ; '+this.largeur+' ; '+this.hauteur+' ; '+this.contenu+' ; ') };
	this.afficher = function(){ dump(this.toString); };
//intialisation
	//~ dump('\n<-Note');
	return this.charger();
}

/**
 * C'est ici que l'on initialise la Note.
 */
/**it's here where we initialise the note
 * 
 */
function note_charger()
{
	//~ dump('\n->note_charger');
	if (!this.fichier.exists())
	{
		this.x = X;
		this.y = Y;
		this.largeur = LARGEUR;
		this.hauteur = HAUTEUR;
		this.contenu = '';
		this.modDate = '';
		//~ dump('\n<-note_charger');
		return false;
	}
	else
	{
		var stream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
		var fileScriptableIO = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
		stream.init(this.fichier, 0x01, 0444, null );
		fileScriptableIO.init(stream);
		this.x = fileScriptableIO.read(4);
		this.y = fileScriptableIO.read(4);
		this.largeur = fileScriptableIO.read(4);
		this.hauteur = fileScriptableIO.read(4);
		this.modDate = fileScriptableIO.read(32);
        // Changed because of this:
        // Just one comment - seems like xnote doesnt allow non-latin characters. 
        // I am from Latvia (Letonnie in French I believe) and we have characters
        // like al�ki which are not preserved when saving a note ...    
        //
		// this.contenu = fileScriptableIO.read(this.fichier.fileSize-16);
        this.contenu = decodeURIComponent( 
            fileScriptableIO.read( this.fichier.fileSize-48 ));

		fileScriptableIO.close();
		stream.close();
		this.contenu=this.contenu.replace(/<BR>/g,'\n');
		//~ dump('\n<-note_charger');
		return true;
	}
}

/**
 * Sauvegarde la note dans un fichier dont le nom est le message-id.
 */
function note_sauver()
{
	//~ dump('\n->note_sauver');
	if (this.fichier.exists())
		this.fichier.remove(true);
	if (this.contenu=='')
		return false;
	this.fichier.create(this.fichier.NORMAL_FILE_TYPE, 0600);
	this.contenu = this.contenu.replace(/\n/g,'<BR>');
	var stream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
	stream.init(this.fichier, 2, 0x200, false); // ouvre en écriture seule
	stream.write(this.x, 4);
	stream.write(this.y, 4);
	stream.write(this.largeur, 4);
	stream.write(this.hauteur, 4);
	stream.write(this.modificationDate, 32);

    // Changed because of this:
    // Just one comment - seems like xnote doesnt allow non-latin characters. 
    // I am from Latvia (Letonnie in French I believe) and we have characters
    // like al�ki which are not preserved when saving a note ...    
    //
	// stream.write(this.contenu, this.contenu.length);
    var contentencode = encodeURIComponent(this.contenu);
    stream.write(contentencode, contentencode.length);

	stream.close();
	this.modification=false;
	//~ dump('\n<-note_sauver');
	return true;
}

/**
 * Supprime la note du disque dur.
 */
function note_supprimer()
{
	//~ dump('\n->note_supprimer');
	if (this.fichier.exists())
	{
		this.fichier.remove(true);
		//~ dump('\n->note_supprimer');
		return true;
	}
	else
	{
		//~ dump('\n->note_supprimer');
		return false;
	}
}
