/*
 * Documentation:
 * https://github.com/thundernest/addon-developer-support/wiki/Using-the-WindowListener-API-to-convert-a-Legacy-Overlay-WebExtension-into-a-MailExtension-for-Thunderbird-78
 */

//TODO
/*
x   note does not close
displaying a new note by click triggers unload listener (ca. 6 times)

upgrade, new pref
*/

'use strict';

const debug = false;//"@@@DEBUGFLAG@@@";

var lastTab = 0, lastWindow = 0;
var openMsgs = [];

var preferenceCache;

var xnote = {};
xnote.text = "";
xnote.date = "";
xnote.inMsgDisplay = false;

// Register the chrome url, so any code running after this can access them.
messenger.WindowListener.registerChromeUrl([
  ["content", "xnote", "chrome/content/"],
  ["resource", "xnote", "chrome/"],

  ["locale", "xnote", "en-US", "chrome/locale/en-US/"],
  ["locale", "xnote", "de", "chrome/locale/de/"],
  ["locale", "xnote", "fr-FR", "chrome/locale/fr-FR/"],
  ["locale", "xnote", "gl", "chrome/locale/gl/"],
  ["locale", "xnote", "it-IT", "chrome/locale/it-IT/"],
  ["locale", "xnote", "ja-JP", "chrome/locale/ja-JP/"],
  ["locale", "xnote", "nl-NL", "chrome/locale/nl-NL/"],
  ["locale", "xnote", "pl-PL", "chrome/locale/pl-PL/"],
  ["locale", "xnote", "pt-BR", "chrome/locale/pt-BR/"],
]);

// This is the current "migration" version for preferences. You can increase it later
// if you happen to need to do more pref (or maybe other migrations) only once
// for a user.
const kCurrentLegacyMigration = 2;

// This is the list of defaults for the legacy preferences.
const kPrefDefaults = {
  usetag: false,
  dateformat: "yyyy-mm-dd - HH:MM",
  width: 250,
  height: 200,
  horPos: 250,
  vertPos: 250,
  show_on_select: true,
  show_in_messageDisplay: true,
  show_first_x_chars_in_col: 20,
  storage_path: "[ProfD]XNote"
};

async function migratePrefs() {
  //console.debug("migratePrefs called.")
  const results = await browser.storage.local.get("preferences");

  const currentMigration =
    results.preferences && results.preferences.migratedLegacy ?
      results.preferences.migratedLegacy : 0;

  if (currentMigration >= kCurrentLegacyMigration) {
    return;
  }

  let prefs = results.preferences || {};

  if (currentMigration < 1) {
    for (const prefName of Object.getOwnPropertyNames(kPrefDefaults)) {
      let oldPrefName = prefName;
      switch (prefName) {
        case "horPos": {
          oldPrefName = "HorPos";
          break;
        }
        case "vertPos": {
          oldPrefName = "VertPos";
          break;
        }
      }
      prefs[prefName] = await browser.xnoteapi.getPref(oldPrefName);
      if (prefs[prefName] === undefined) {
        prefs[prefName] = kPrefDefaults[prefName];
      }
    }
  }

  if (currentMigration < 2) {
    prefs["show_in_messageDisplay"] = kPrefDefaults["show_in_messageDisplay"];
    setTbPref("extensions.xnote.show_in_messageDisplay", kPrefDefaults["show_in_messageDisplay"]);
  }

  prefs.migratedLegacy = kCurrentLegacyMigration;
  //console.debug("Storing migrated preferences.");
  await browser.storage.local.set({ "preferences": prefs });
}

async function getTbPref(name) {
  return browser.xnoteapi.getTbPref(name);
}

async function setTbPref(name, value) {
  browser.xnoteapi.setTbPref(name, value);
}

function getPreferences() {
  // Why would you want to work with the cached values?
  return preferenceCache;
}

async function setPreferences(preferences) {
  preferenceCache = preferences;
  browser.storage.local.set({ preferences });
  browser.xnoteapi.setPreferences(preferences);
}

async function selectDirectory(startDir, title) {
  let result = await browser.xnotefiles.selectDirectory(null, startDir, title);
  //console.debug("select directory returns: " + result);
  return result;
}

async function getProfileDirectory() {
  return await browser.xnotefiles.getProfileDirectory();
}

async function appendRelativePath(basePath, extension) {
  return await browser.xnotefiles.appendRelativePath(basePath, extension);
}

async function wait(t) {
  //	let t = 5000;
  await new Promise(resolve => window.setTimeout(resolve, t));
}

// landing windows.
messenger.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
  // if (temporary) return; // skip during development
  //  console.log("install reason:", reason);
  switch (reason) {
    case "install":
      {
        let url = browser.runtime.getURL("popup/installed.html");
        //await browser.tabs.create({ url });
        await messenger.tabs.create({ url });
        //       let wID1 = await browser.windows.create({ url, type: "popup", width: 910, height: 750, });
        //       console.log ("wid", wID1);   
      }
      break;
    // see below
    case "update":
      {
        let url = browser.runtime.getURL("popup/update.html");
        //        let url2 = browser.runtime.getURL("popup/installed.html");
        await browser.tabs.create({ url });
        //   let wID = await browser.windows.create({ url, type: "popup", width: 910, height: 750, });
        //        console.log ("wid", wID);
        //       debugger;
        //        let tID = await messenger.tabs.create({active:true, index:1, url: "http://www.google.com", windowId: wID.id});
        ////   let tID = await messenger.tabs.create({windowId: wID.id});
        //    tID = await messenger.tabs.create({windowId: wID.id});
        //     tID = await messenger.tabs.create({windowId: wID.id});
        //      console.log ("tid", tID);   
      }
      break;
    // see below
  }
});


//var portFromBookmarks = null;
async function main() {
  await migratePrefs();

  preferenceCache = (await browser.storage.local.get("preferences")).preferences;
  await browser.xnoteapi.setPreferences(preferenceCache);
  await browser.xnoteapi.init();

  messenger.tabs.onActivated.addListener(async (activeInfo) => {
    lastTab = activeInfo.tabId;
    lastWindow = activeInfo.windowId;
    let tabInfo = await messenger.tabs.get(activeInfo.tabId);
    if (!tabInfo.mailTab) {
      messenger.xnoteapi.closeNoteWindow(activeInfo.windowId);
      xnote.text = "";
    };
  });


  browser.browserAction.onClicked.addListener(async (tab, info) => {
    let xnote_displayed = await messenger.xnoteapi.hasOpenNoteWindow(tab.windowId);
    if (!xnote_displayed) {
      let message = await browser.messageDisplay.getDisplayedMessage(tab.id)
      await messenger.xnoteapi.openNoteWindow(tab.windowId, message.id, true);
    } else {
      messenger.xnoteapi.closeNoteWindow(tab.windowId);
    }
  });
  messenger.messageDisplay.onMessageDisplayed.addListener(async (tab, message) => {
    messenger.xnoteapi.closeNoteWindow(tab.windowId);
    await messenger.xnoteapi.openNoteWindow(tab.windowId, message.id, false);
  });



  messenger.NotifyTools.onNotifyBackground.addListener(async (info) => {
    switch (info.command) {
      case "setBookmark":
        messenger.runtime.sendMessage("bookmarks@opto.one", { content: "addXnoteBookmark" }, {});
        break;
    }
  });



  /*
   * Show note info in message display
   */
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    //console.log({message, sender});
    if (message.command == "getXNote") {
      let msg = await messenger.messageDisplay.getDisplayedMessage(sender.tab.id);
      let xnote = await messenger.xnoteapi.getXNote(msg.id);
      if (preferenceCache["show_in_messageDisplay"] == false) xnote.text = "";
      return xnote;
    };
  });

  // Only loads into new messages, so on install, it will not load into the
  // already open message.
  await messenger.messageDisplayScripts.register({
    js: [{ file: "mDisplay.js" }]
    //,
    //css: [{ file: "/src/message-content-styles.css" }],
  });

  /*
   * Start listening for opened windows. Whenever a window is opened, the registered
   * JS file is loaded. To prevent namespace collisions, the files are loaded into
   * an object inside the global window. The name of that object can be specified via
   * the parameter of startListening(). This object also contains an extension member.
   */
  
  // WE USE THIS ONLY FOR THE MENU ENTRIES - GET RID OF IT - USE MENUS API
  messenger.WindowListener.registerWindow(
    "chrome://messenger/content/messenger.xhtml", 
    "chrome/content/scripts/xn-xnote-overlay.js"
  );
  messenger.WindowListener.startListening();
}

main().catch(console.error);
