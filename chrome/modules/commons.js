if (!net) var net = {};
if (!net.froihofer) net.froihofer={};
if (!net.froihofer.xnote) net.froihofer.xnote={};

//See https://developer.mozilla.org/en/Using_JavaScript_code_modules for explanation
var EXPORTED_SYMBOLS = ["net"];

net.froihofer.xnote.Commons = function() {
  // CONSTANT - Default tag name and color
  const XNOTE_TAG_NAME = "XNote";
  const XNOTE_TAG_COLOR = "#FFCC00"

  //Application IDs of applications we support
  const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
  const SEAMONKEY_ID = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}";

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

  //result
  var pub = {
    //Current XNote version
    get XNOTE_VERSION() {
      return "2.2.3a1";
    },

    init : function() {
      var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                              .getService(Components.interfaces.nsIXULAppInfo);
      if(appInfo.ID == THUNDERBIRD_ID) {
        _runningThunderbird = true;
      }
      else {
        _runningThunderbird = false;
      }

      _xnotePrefs = Components.classes["@mozilla.org/preferences-service;1"].
                     getService(Components.interfaces.nsIPrefService).
                     getBranch("xnote.");
      _xnotePrefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    },

    get isInThunderbird() {
      return _runningThunderbird;
    },

    get xnotePrefs() {
      return _xnotePrefs;
    },

    get useTag() {
      return _useTag;
    },

    checkXNoteTag : function() {
      //Check preference for whether tags should be used
      _useTag = _xnotePrefs.getBoolPref("usetag");
      if(_useTag) {
        // Get the tag service.
        var tagService = Components.classes["@mozilla.org/messenger/tagservice;1"]
                                 .getService(Components.interfaces.nsIMsgTagService);

        // Test if the XNote Tag already exists, if not, create it
        if( tagService.getTagForKey( "xnote" ) == '' ) {
          // ~dump( "NOT FOUND XNOTE_TAG_NAME" );
          tagService.addTagForKey( "xnote", XNOTE_TAG_NAME, XNOTE_TAG_COLOR, '');
        }
      }
    }

  };

  return pub;
}();