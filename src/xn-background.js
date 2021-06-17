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

//use(strict);


const debug = "@@@DEBUGFLAG@@@";

var lastTab = 0, lastWindow = 0;
var openMsgs = [];

var xnote_displayed = false;

var _preferences;

var xnote = {};
xnote.text = "";
xnote.date = "";
xnote.inMsgDisplay = false;
xnote.msgTab = -1;


messenger.tabs.onRemoved.addListener(tabRemoved);

async function tabRemoved(tabId) {
  //console.log("tab gone", tabId);
}

browser.runtime.onMessage.addListener(notifyMsgDisplay);

async function notifyMsgDisplay(message, sender, sendResponse) {
  //console.log("received from msgDisplay");
  //console.log("Msg:", message.command, "tabid", sender.tab.id);
  if (message.command == "getXNote") {
    let msg = await messenger.messageDisplay.getDisplayedMessage(sender.tab.id);
    //console.log("msg", msg);
    let xnote = await messenger.xnoteapi.getXNote(msg.id);
    //openMsgs[msg.id] = sender.tab.id;
    //console.log("bcknote", xnote);
    // let data = await messenger.NotifyTools.notifyExperiment({command: "getNote"});//.then((data) => {
    //    console.log(data)
    //  });
    sendResponse({ note: "xnote" });
    if (_preferences.show_in_messageDisplay == false) xnote.text = "";
    return xnote;
    //messenger.runtime.sendMessage({"toMsgDisplay": xnote.text});

    /*
      browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("link.png"),
        "title": "You clicked a link!",
        "message": message.url
      });
      */
  }
}




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
    prefs.show_in_messageDisplay = kPrefDefaults.show_in_messageDisplay;
    setTbPref("extensions.xnote.show_in_messageDisplay", kPrefDefaults.show_in_messageDisplay);
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
  return _preferences;
}

async function setPreferences(preferences) {
  _preferences = preferences;
  browser.storage.local.set({ "preferences": _preferences });
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


// landing windows.
messenger.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
  // if (temporary) return; // skip during development
 //  console.log("install reason:", reason);
  switch (reason) {
    case "install":
      {
        let url = browser.runtime.getURL("popup/installed.html");
        //await browser.tabs.create({ url });
        await browser.windows.create({ url, type: "popup", width: 910, height: 750, });
      }
      break;
    // see below
    case "update":
      {
        let url = browser.runtime.getURL("popup/update.html");
        //await browser.tabs.create({ url });
        await browser.windows.create({ url, type: "popup", width: 910, height: 750, });
      }
      break;
    // see below
  }
});


async function msgDisplayListener(tab, msg) {
  //console.log("tab", tab.id, tab.mailTab);
  xnote.msgTab = tab.id;
  /*
  await messenger.tabs.executeScript(tab.id, {
    file:  "mDisplay.js"
  }); 
  */
}

async function wait(t) {
  //	let t = 5000;
  await new Promise(resolve => window.setTimeout(resolve, t));

}
async function main() {
  await migratePrefs();

  _preferences = (await browser.storage.local.get("preferences")).preferences;
  if (debug) {
    //console.debug({ "Preferences": _preferences });
  }
  await browser.xnoteapi.setPreferences(_preferences);
  await browser.xnoteapi.init();

  /* //does not solve timing at install*/
  await messenger.messageDisplayScripts.register({
    js: [{ file: "mDisplay.js" }]
    //,
    //css: [{ file: "/src/message-content-styles.css" }],
  });


  /*  nope, needs to be loaded repeatedly into each messageDisplay
    let TBwindows = await messenger.windows.getAll({populate:true} );
//    console.log("msgDisplays", TBwindows);
   
    for (let TBwindow of TBwindows ) {
      //console.log("tabs", msgDisplay.tabs);
      if (TBwindow.type == "messageDisplay") {
 //       console.log("messageDisplay", TBwindow.tabs[0].id);
        await messenger.tabs.executeScript(TBwindow.tabs[0].id, {
          file:  "mDisplay.js"
        });  
      }    
      else {
        for (let tab of TBwindow.tabs) {
          if (tab.mailTab) {
 //           console.log("mailTab", tab.id);
            await messenger.tabs.executeScript(tab.id, {
              file:  "mDisplay.js"
            });  
          }        
        };
  
      };
    
    
    
    };
  */

  //console.log("msgDisplays", msgDisplays);
  messenger.messageDisplay.onMessageDisplayed.addListener((tab, message) => {
    //console.log(`Message displayed in tab ${tab.id}: ${message.subject}`);
    xnote_displayed = false;  // for the case that no autodisplay, to be able to manually toggle the display
  });

  //    messenger.messageDisplayAction.disable();
  //    messenger.messageDisplayAction.setBadgeText({text:"test"});

  messenger.tabs.onActivated.addListener(async (activeInfo) => {
    //console.log("tab activated "+ activeInfo.tabId + " window: " + activeInfo.windowId);
    lastTab = activeInfo.tabId;
    lastWindow = activeInfo.windowId;
    let tabInfo = await messenger.tabs.get(activeInfo.tabId);
    if (!tabInfo.mailTab) {
      messenger.xnoteapi.closeNoteWindow();
      xnote.text = "";
    }
  });

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

  messenger.WindowListener.registerWindow("chrome://messenger/content/messenger.xhtml", "chrome/content/scripts/xn-xnote-overlay.js");

  browser.browserAction.onClicked.addListener(async (tab, info) => {
    if (!xnote_displayed) {
      messenger.xnoteapi.initNote();
      xnote_displayed = true;
    }
    else {
      messenger.xnoteapi.closeNoteWindow();
      xnote_displayed = false;
    }
  });

  browser.browserAction.disable();

  messenger.NotifyTools.onNotifyBackground.addListener(async (info) => {
    switch (info.command) {
      case "addToMsgDisplay":
        if (true) {
          xnote.text = info.text;
          xnote.date = info.date;
          //        console.log("msgDisplay");
          //        console.log(xnote.text);
          //          let activeTab = await messenger.tabs.query({windowType: "messageDisplay"});
          let activeTab = await messenger.tabs.query({ active: true, currentWindow: true });
          //        console.log(activeTab);
          //          await wait (5000);
          /*
          await messenger.tabs.executeScript(activeTab[0].id, {
            file:  "mDisplay.js"
          });  
          
          //debugger;
                  if (info.text.length>0)  await messenger.tabs.sendMessage(activeTab[0].id,{XNoteText: info.text, XNoteDate: info.date}, null)  ;
          */
        }
        //        console.log(msgtab?"")

        // console.log("msgtab?", xnote.msgTab);
        let rv = "received from background";
        return rv;
    }
  });


  messenger.messageDisplay.onMessageDisplayed.addListener(msgDisplayListener);



  /*
   * Start listening for opened windows. Whenever a window is opened, the registered
   * JS file is loaded. To prevent namespace collisions, the files are loaded into
   * an object inside the global window. The name of that object can be specified via
   * the parameter of startListening(). This object also contains an extension member.
   */
  messenger.WindowListener.startListening();
}

main().catch(console.error);