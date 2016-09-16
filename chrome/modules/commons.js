
//See https://developer.mozilla.org/en/Using_JavaScript_code_modules for explanation
let EXPORTED_SYMBOLS = ["Commons", "UTF8Coder"];

var Commons = function() {
  const _XNOTE_VERSION = "2.2.13";
  
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
      return _XNOTE_VERSION;
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
                     getBranch("extensions.xnote.");
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
        var prefs = Components.classes['@mozilla.org/preferences-service;1']
                                 .getService(Components.interfaces.nsIPrefBranch2);

        var addTag = true;
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
          var tagName = XNOTE_TAG_NAME;
          var tagColor = XNOTE_TAG_COLOR;
          if (prefs.prefHasUserValue("mailnews.tags.xnote.tag")) {
            tagName = prefs.getCharPref("mailnews.tags.xnote.tag");
            if (tagName.trim() == "") tagName = XNOTE_TAG_NAME;
          }
          if (prefs.prefHasUserValue("mailnews.tags.xnote.color")) tagColor = prefs.getCharPref("mailnews.tags.xnote.color");
          tagService.addTagForKey( "xnote", tagName, tagColor, '');
        }
      }
    }

  };

  return pub;
}();


/*
UTF-8 Encoder / Decoder
Original code from Web Toolkit: http://www.webtoolkit.info/javascript-utf8.html
Modifications by Harry O.
*/
 
/**
*
*  UTF-8 data encode / decode
*  http://www.webtoolkit.info/
*
**/

var UTF8Coder = function() {

  var pub = {
    
  }
    // public method for url encoding
  pub.encode = function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  // public method for url decoding
  pub.decode = function (utftext) {
    var string = "";
    var i = 0;
    var c = 0;
    var c1 = 0;
    var c2 = 0;
    while ( i < utftext.length ) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }

  return pub;
}();
