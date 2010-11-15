if (!net) var net = {};
if (!net.froihofer) net.froihofer={};
if (!net.froihofer.xnote) net.froihofer.xnote={};


net.froihofer.xnote.ColumnNote = function() {

  var pub = {
    columnHandler : {
      getCellText:         function(row, col) {
        return null;
      },
      getSortStringForRow: function(hdr) {
        return pub.hasNote(hdr.messageId);
      },
      isString:            function() {
        return true;
      },

      getCellProperties:   function(row, col, props){},
      getRowProperties:    function(row, props){},
      getImageSrc:         function(row, col) {
        var key = gDBView.getKeyAt(row);
        var hdr = gDBView.getFolderForViewIndex(row).GetMessageHeader(key);
        if(pub.hasNote(hdr.messageId)){
          return "chrome://xnote/skin/xnote_context.png";
        }
        else {
          return null;
        }
      },
      getSortLongForRow:   function(hdr) {
        return pub.hasNote(hdr.messageId);
      }
    },

    DbObserver : {
      // Components.interfaces.nsIObserver
      observe: function(aMsgFolder, aTopic, aData) {
        pub.addCustomColumnHandler();
      }
    },

    /*
     * Get the notes file associated with the selected mail. Returns a handle to the
     * notes file if the message has a note, i.e., the corresponding file exists.
     * Returns null otherwise.
     */
    hasNote : function (messageID) {
      return net.froihofer.xnote.Note(messageID).exists();
    },

    doOnceLoaded : function () {
      var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
      ObserverService.addObserver(pub.DbObserver, "MsgCreateDBView", false);
    },

    addCustomColumnHandler : function () {
      gDBView.addColumnHandler("colNote", pub.columnHandler);
    }
  }

  return pub;
}();

window.addEventListener("load", net.froihofer.xnote.ColumnNote.doOnceLoaded, false);
