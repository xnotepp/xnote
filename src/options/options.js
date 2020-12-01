import '/extlib/l10n.js';

//The object only works if retrieved through chrome.extension, but not
//through browser.extension or messenger.extension
var bgPage = chrome.extension.getBackgroundPage();

var prefs = bgPage.getPreferences();

var btnSelectStoragePath = document.getElementById("btnSelectStoragePath");

function isInputType(node, type){
	return node.nodeName.toLowerCase() == "input" && node.type.toLowerCase() == type.toLowerCase();
}

async function selectStoragePath() {
  console.debug("selectStoragePath called");
  let startDir = prefs.storage_path;
  let profileDir = await bgPage.getProfileDirectory();
  if (startDir.startsWith("[ProfD]")) {
    try {
      console.debug(`profileDir: ${profileDir}; startDir: ${startDir}`);
      startDir = await bgPage.appendRelativePath(profileDir, startDir.substring(7));
      console.debug(`startDir for selectStoragePath: ${startDir}`);
    }
    catch (e) {
      console.debug(`Directory does not exist: ${startDir}.`, e);
      startDir = profileDir;
    }
  }
  try {
    bgPage.selectDirectory(startDir, bgPage.browser.i18n.getMessage("Select.storage.dir")).then((storagePath) => {
      console.debug(`selected storage path: ${storagePath}`);
      if (storagePath == null) return;
      //Check whether the new path is inside the profile directory
      //and if yes, make the path relative to the profile.
      if (storagePath.indexOf(profileDir) == 0) {
        if (storagePath.length == profileDir.length) {
          storagePath = "[ProfD]";
        }
        else {
          storagePath = "[ProfD]"+storagePath.substr(profileDir.length+1);
        }
      }
      let prefPath = document.getElementById("storage.path");
      prefPath.value = storagePath;
      prefs.storage_path = storagePath;
    });
  }
  catch (e) {
    console.error(e);
  }
}

async function savePrefs() {
  const storagePathChanged = document.getElementById('storage.path').value != prefs.storage_path;
  for (const node of document.querySelectorAll('[data-preference]')) {
    const pref = node.dataset.preference;
    //console.debug(`Saving preference: ${pref}`);
    if (pref.startsWith("tag.")) {
      switch (pref) {
        case "tag.color":
          bgPage.setTbPref("mailnews.tags.xnote.color", node.value);
          break;
        case "tag.name":
          bgPage.setTbPref("mailnews.tags.xnote.tag", node.value);
          break;
        default:
          console.error(`Unknown tag preference ${pref}`);
      }
    }
    else {
      switch(node.nodeName) {
        case "SELECT":
          for(let option of node.querySelectorAll("option")){
            if(option.selected){
              prefs[pref] = node.value;
              break;
            }
          }
          break;
        case "INPUT":
          if(isInputType(node,"checkbox")){
            prefs[pref] = node.checked;
          } else if(isInputType(node, "radio") && node.checked){
            prefs[pref] = node.value;
          } else if (isInputType(node, "number")) {
            prefs[pref] = parseInt(node.value);
          }
          else {
            prefs[pref] = node.value;
          }
          break;
        default:
          console.error(`Unknown node type ${node.nodeName}`);
          console.error(node);
      }
    }
  }
  bgPage.setPreferences(prefs);
}

async function initOptions() {
  //console.debug(prefs);

  for (const node of document.querySelectorAll('[data-preference]')) {
    const pref = node.dataset.preference;
    //console.debug(`Loading preference: ${pref}`);
    const value = prefs[pref];

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
          if(isInputType(node, "checkbox")) {
            node.checked = value;
          } else if(isInputType(node, "radio")) {
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
