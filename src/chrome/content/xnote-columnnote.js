// encoding='UTF-8'

/*
  # File : xnote-window.xul
  # Authors : Hugo Smadja, Lorenz Froihofer, Klaus Buecher
  # Description : Functions associated with the XNote window (xnote-window.xul).
*/

var Services = globalThis.Services || ChromeUtils.import(
  "resource://gre/modules/Services.jsm"
).Services;
var { xnote } = ChromeUtils.import("resource://xnote/modules/xnote.jsm");

var xnoteColumnObj = function () {

  function getHeaderForRow(row) {
    return gDBView.getFolderForViewIndex(row).
      GetMessageHeader(gDBView.getKeyAt(row));
  }

  var pub = {
    columnHandler: {
      getCellText: function (row, col) {
        // ~ dump("xnote: getCellText: "+JSON.stringify(xnote, null, 2)+"\n");
        let xnotePrefs = xnote.ns.Commons.xnotePrefs;
        if (xnotePrefs.show_first_x_chars_in_col > 0) {
          let note = new xnote.ns.Note(getHeaderForRow(row).messageId);
          if (note.exists()) {
            return " " + note.text.substr(0, xnotePrefs.show_first_x_chars_in_col);
          }
        }
        return null;
      },
      getSortStringForRow: function (hdr) {
        let xnotePrefs = xnote.ns.Commons.xnotePrefs;
        if (xnotePrefs.show_first_x_chars_in_col > 0) {
          let note = new xnote.ns.Note(hdr.messageId);
          if (note.exists()) {
            return " " + note.text.substr(0, xnotePrefs.show_first_x_chars_in_col);
          }
          else {
            return "";
          }
        }
        return pub.hasNote(hdr.messageId);
      },
      isString: function () {
        return true;
      },

      getCellProperties: function (row, col) { },
      getRowProperties: function (row) { },
      getImageSrc: function (row, col) {
        let hdr = getHeaderForRow(row);
        if (pub.hasNote(hdr.messageId)) {
          return "resource://xnote/skin/xnote_context.png";
        }
        else {
          return null;
        }
      },
      getSortLongForRow: function (hdr) {
        return pub.hasNote(hdr.messageId);
      }
    },

    DbObserver: {
      // Components.interfaces.nsIObserver
      observe: function (aMsgFolder, aTopic, aData) {
        pub.addCustomColumnHandler();
      }
    },

    /*
     * Get the notes file associated with the selected mail. Returns a handle to the
     * notes file if the message has a note, i.e., the corresponding file exists.
     * Returns null otherwise.
     */
    hasNote: function (messageID) {
      return xnote.ns.Note(messageID).exists();
    },

    onLoad: function () {
      let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
      ObserverService.addObserver(pub.DbObserver, "MsgCreateDBView", false);
    },


    onUnload: function () {
      let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
      ObserverService.removeObserver(pub.DbObserver, "MsgCreateDBView");
      //pub.removeCustomColumnHandler();
    },

    addCustomColumnHandler: function () {
      gDBView.addColumnHandler("xnoteCol", pub.columnHandler);
    },

    removeCustomColumnHandler: function () {
      gDBView.removeColumnHandler("xnoteCol");
    }
  }

  return pub;
}();
