if (!xnote) var xnote={};
if (!xnote.ns) xnote.ns={};


xnote.ns.Upgrades = function() {
  
  function upgradeTo_2_2_11() {
    // TODO: Move preferences to extensions.xnote... namespace
  }
  
  var pub = {
    
    checkUpgrades : function (storedVersion, currentVersion) {
      var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                        .getService(Components.interfaces.nsIVersionComparator);
      if (versionComparator.compare(storedVersion, "2.2.11") < 0) {
        upgradeTo_2_2_11();
      }
    }

  };

  return pub;
}();
