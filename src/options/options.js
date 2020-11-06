import '/extlib/l10n.js';

var prefs;
var defaultPrefs;

//The object only works if retrieved through chrome.extension, but not
//through browser.extension or messenger.extension
var bgPage = chrome.extension.getBackgroundPage();

var btnSave = document.getElementById("btnSave");
var btnSelectStoragePath = document.getElementById("btnSelectStoragePath");

function isButton(node){
	return node.nodeName == "INPUT" && node.type.toLocaleUpperCase() === "BUTTON"
}
function isCheckbox(node){
	return node.nodeName == "INPUT" && node.type.toLocaleUpperCase() === "CHECKBOX"
}
function isRadio(node){
	return node.nodeName == "INPUT" && node.type.toLocaleUpperCase() === "RADIO"
}

function savePrefs() {
  console.log("Save prefs called");
}

function selectStoragePath() {
  console.log("selectStoragePath called");
}

async function initOptions() {
  prefs = await browser.storage.local.get("preferences");
  prefs = prefs.preferences;
  console.debug(prefs);

  for (const node of document.querySelectorAll('[data-preference]')) {
    let pref = node.dataset.preference;
    console.debug(`Loading preference: ${pref}`);
    let value = prefs[pref];

    if (pref.startsWith("tag.")) {
      switch (pref) {
        case "tag.color":
          node.value = await bgPage.getTbPref("mailnews.tags.xnote.color");
          break;
        case "tag.name":
          node.value = await bgPage.getTbPref("mailnews.tags.xnote.tag");
          break;
        default:
          console.error(`Unknown tag preference ${pref}`);
      }
    }
    else {
      switch(node.nodeName) {
        case "SELECT":
          for(let option of node.querySelectorAll("option")){
            if(option.value == value){
              option.selected = true;
              break;
            }
          }
          break;
        case "INPUT":
          if(isCheckbox(node)){
            node.checked = value;
          } else if(isRadio(node)){
            node.checked = (value === node.value);
          } else {
            node.value = value;
          }
          break;
        default:
          console.error(`Unknown node type ${node.nodeName}`);
          console.error(node);
      }
    }
  }

	btnSave.addEventListener('click', savePrefs);
	btnSelectStoragePath.addEventListener('click', selectStoragePath);  

}

document.addEventListener('DOMContentLoaded', () => {
  initOptions();
}, { once: true });

/*if (!xnote) var xnote = {};
if (!xnote.ns) xnote.ns = {};

ChromeUtils.import("resource://xnote/modules/commons.js", xnote.ns);
ChromeUtils.import("resource://xnote/modules/storage.js", xnote.ns);
ChromeUtils.import("resource://gre/modules/Services.jsm");

xnote.ns.Preferences = function() {
  let _stringBundle = Services.strings.createBundle("chrome://xnote/locale/xnote-overlay.properties");

  var pub = {
    selectStoragePath : function() {
      let fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
      fp.init(window, _stringBundle.GetStringFromName("Select.storage.dir"), fp.modeGetFolder);
      let currentDir = xnote.ns.Storage.noteStorageDir;
      fp.displayDirectory = currentDir;
      fp.open(rv => {
        if (rv != fp.returnOK) {
          return;
        };
        var storagePath =  fp.file.path;
        //Check whether the new path is inside the profile directory
        //and if yes, make the path relative to the profile.
        var directoryService = 	Components.classes['@mozilla.org/file/directory_service;1']
                          .getService(Components.interfaces.nsIProperties);
        let profileDir = directoryService.get('ProfD', Components.interfaces.nsIFile);
        if (storagePath.indexOf(profileDir.path) == 0) {
          if (storagePath.length == profileDir.path.length) {
            storagePath = "[ProfD]"
          }
          else {
            storagePath = "[ProfD]"+storagePath.substr(profileDir.path.length+1);
          }
        }
        let prefPath = document.getElementById("xnote-pref-storage_path");
        prefPath.value = storagePath;
      });
    }
  };

  return pub;
}(); */
