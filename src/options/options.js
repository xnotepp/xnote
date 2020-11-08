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

async function savePrefs() {
  console.debug("Save prefs called");
}

async function selectStoragePath() {
  console.debug("selectStoragePath called");
  let startDir = prefs["storage_path"];
  let profileDir = await bgPage.getProfileDirectory();
  if (startDir.startsWith("[ProfD]")) {
    console.debug(`profileDir: ${profileDir}; startDir: ${startDir}`);
    startDir = await bgPage.appendRelativePath(profileDir, startDir.substring(7));
    console.debug(`startDir for selectStoragePath: ${startDir}`);
  }
  try {
  let storagePath = await bgPage.selectDirectory(startDir, bgPage.browser.i18n.getMessage("Select.storage.dir"));
  console.debug(`selected storage path: ${storagePath}`)
  if (storagePath == null) return;
  //Check whether the new path is inside the profile directory
  //and if yes, make the path relative to the profile.
  if (storagePath.indexOf(profileDir) == 0) {
    if (storagePath.length == profileDir.length) {
      storagePath = "[ProfD]"
    }
    else {
      storagePath = "[ProfD]"+storagePath.substr(profileDir.length+1);
    }
  }
  let prefPath = document.getElementById("storage.path");
  prefPath.value = storagePath;
}
catch (e) {
  console.error(e);
}
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