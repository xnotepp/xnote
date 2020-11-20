var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm"),
    { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm"),
    win = Services.wm.getMostRecentWindow("mail:3pane");



var xnotefiles = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {    
    return {
      xnotefiles: {
        selectDirectory : async function(window, startDirectory, title) {
          let domWindow = window;
          if (domWindow == null) {
            domWindow = Services.wm.getMostRecentWindow(null);
          }
          let fp = Components.classes["@mozilla.org/filepicker;1"]
                         .createInstance(Components.interfaces.nsIFilePicker);
          fp.init(domWindow, title, fp.modeGetFolder);
          let FileUtils = ChromeUtils.import("resource://gre/modules/FileUtils.jsm").FileUtils;
          let startDir = new FileUtils.File(startDirectory);
          fp.displayDirectory = startDir;
          return new Promise(function(resolve, reject) {
						fp.open(rv => {
							if(rv === fp.returnOK){
								resolve(fp.file.path);
							}
						});
					})
        },

        getProfileDirectory: async function() {
          var directoryService = 	Components.classes['@mozilla.org/file/directory_service;1']
                              .getService(Components.interfaces.nsIProperties);
          let profileDir = directoryService.get('ProfD', Components.interfaces.nsIFile);
          console.debug(`getProfileDir returns: ${profileDir.path}`);
          return profileDir.path;
        },

        appendRelativePath: async function(path, extension) {
          let FileUtils = ChromeUtils.import("resource://gre/modules/FileUtils.jsm").FileUtils;
          var result = new FileUtils.File(path);
          result.appendRelativePath(extension);
          console.debug(result);
          console.debug(`appendRelativePath result: ${result.path}`);
          return result.path;
        }
      }  
    }
  };
}
