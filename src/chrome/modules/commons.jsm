
//See https://developer.mozilla.org/en/Using_JavaScript_code_modules for explanation
let EXPORTED_SYMBOLS = ["Commons"];

var Commons = function() {
  const _XNOTE_VERSION = "3.1.5";//"@@@XNOTE.VERSION@@@";
  
  // CONSTANT - Default tag name and color
  const XNOTE_TAG_NAME = "XNote";
  const XNOTE_TAG_COLOR = "#FFCC00";

  //Application IDs of applications we support
  const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
  //const SEAMONKEY_ID = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}";

  /**
   * Used to distinguish between Thunderbird and Seamonkey
   */
  var _runningThunderbird;

  /**
   * Using tags?
   */
  var _useTag;

  //XNote prefs
  var _xnotePrefs;

  //XNote legacy prefs API
  var _xnoteLegacyPrefs;

  //is XNote installed for the first time on that TB profile?
  var _isNewInstallation;

  //result
  var pub = {
    //Current XNote version
    get XNOTE_VERSION() {
      return _XNOTE_VERSION;
    },

    init : function() {
      let appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                              .getService(Components.interfaces.nsIXULAppInfo);
      if(appInfo.ID == THUNDERBIRD_ID) {
        _runningThunderbird = true;
      }
      else {
        _runningThunderbird = false;
      }

      _xnoteLegacyPrefs = Components.classes["@mozilla.org/preferences-service;1"].
                     getService(Components.interfaces.nsIPrefService).
                     getBranch("extensions.xnote.");
      _xnoteLegacyPrefs.QueryInterface(Components.interfaces.nsIPrefBranch);
    },
    get isInThunderbird() {
      return _runningThunderbird;
    },
    get isNewInstallation() {
      return _isNewInstallation;
    },
    set isNewInstallation(isNewInstallation) {
      _isNewInstallation = isNewInstallation;
    },
    get xnoteLegacyPrefs() {
      return _xnoteLegacyPrefs;
    },
    get xnotePrefs() {
      return _xnotePrefs;
    },
    set xnotePrefs(xnotePrefs) {
      console.debug(`New XNote Prefs: ${JSON.stringify(xnotePrefs)}`);
      _xnotePrefs = xnotePrefs;
    },
    get useTag() {
      return _useTag;
    },

    checkXNoteTag : function() {
      //Check preference for whether tags should be used
      _useTag = _xnotePrefs.usetag;
      console.debug(`checkXNoteTag: usetag=${_useTag}`);
      if(_useTag) {
        // Get the tag service.
        let tagService = Components.classes["@mozilla.org/messenger/tagservice;1"]
                                 .getService(Components.interfaces.nsIMsgTagService);
        let prefs = Components.classes['@mozilla.org/preferences-service;1']
                                 .getService(Components.interfaces.nsIPrefBranch);

        let addTag = true;
        // Test if the XNote Tag already exists, if not, create it
        try {
          if (tagService.getTagForKey("xnote").trim() != "") {
            addTag = false;
            // The following happens if the user enters a name in the
            // preferences dialog, but does not choose a color.
            if (!prefs.prefHasUserValue("mailnews.tags.xnote.color")) {
              prefs.setCharPref("mailnews.tags.xnote.color", XNOTE_TAG_COLOR);
            }
          }
        }
        catch (e) {
          //This happens if the tag does not exist.
          //~dump("\nCould not get tag for key 'xnote': "+e.message+"\n"+e.trace);
        }
        if (addTag) {
          let tagName = XNOTE_TAG_NAME;
          let tagColor = XNOTE_TAG_COLOR;
          if (prefs.prefHasUserValue("mailnews.tags.xnote.tag")) {
            tagName = prefs.getCharPref("mailnews.tags.xnote.tag");
            if (tagName.trim() == "") tagName = XNOTE_TAG_NAME;
          }
          if (prefs.prefHasUserValue("mailnews.tags.xnote.color")) tagColor = prefs.getCharPref("mailnews.tags.xnote.color");
          tagService.addTagForKey( "xnote", tagName, tagColor, '');
        }
      }
    },
    
    printEventDomAttrModified : function (e) {
      //~dump("domAttrModified: "+e.attrName+", node="+e.relatedNode.nodeName+", node.ownerElement="+e.relatedNode.ownerElement+"\n");
      //~for (var i in e.relatedNode.ownerElement) dump(i+"\n");
      //~dump("\n");
    }

  };
  
  return pub;
}();


//console.debug("Initializing xnote commons.jsm");