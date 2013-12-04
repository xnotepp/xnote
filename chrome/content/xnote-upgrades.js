if (!net) var net = {};
if (!net.froihofer) net.froihofer={};
if (!net.froihofer.xnote) net.froihofer.xnote={};


net.froihofer.xnote.Upgrades = function() {
  
  function upgradeTo_2_2_10() {
    // TODO: Move preferences to extensions.xnote... namespace
  }
  
  var pub = {
    
    checkUpgrades : function (storedVersion, currentVersion) {
      var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                        .getService(Components.interfaces.nsIVersionComparator);
      if (versionComparator.compare(storedVersion, "2.2.9") < 0) {
        upgradeTo_2_2_9();
      }
    }

  };

  return pub;
}();