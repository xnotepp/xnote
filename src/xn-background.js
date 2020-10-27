/*
 * Documentation:
 * https://github.com/thundernest/addon-developer-support/wiki/Using-the-WindowListener-API-to-convert-a-Legacy-Overlay-WebExtension-into-a-MailExtension-for-Thunderbird-78
 */

//TODO
/*
all locale files
x   note does not close
x preferences: currently shown in tools->addon settings.
displaying a new note by click triggers unload listener (ca. 6 times)
*/

var lastTab=0, lastWindow=0;

async function main() {

    // landing windows.
    messenger.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
      
      // if (temporary) return; // skip during development
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
    
 
    messenger.messageDisplay.onMessageDisplayed.addListener((tab, message) => {
      console.log(`Message displayed in tab ${tab.id}: ${message.subject}`);
    });

//    messenger.messageDisplayAction.disable();
//    messenger.messageDisplayAction.setBadgeText({text:"test"});
    
    messenger.tabs.onActivated.addListener(async (activeInfo) => {
      
      console.log("tab activated "+ activeInfo.tabId + " window: " + activeInfo.windowId);
      lastTab = activeInfo.tabId;
      lastWindow = activeInfo.windowId;
      let tabInfo = await messenger.tabs.get( activeInfo.tabId);
      if (!tabInfo.mailTab   )   messenger.Utilities.closeNoteWindow();
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
 
    messenger.WindowListener.registerOptionsPage("chrome://xnote/content/preferences.xhtml"); 
    
 

    messenger.WindowListener.registerDefaultPrefs("chrome/content/scripts/xn-defaultPrefs.js");

 //   messenger.WindowListener.registerWindow("chrome://messenger/content/mainMailToolbox.inc.xhtml", "chrome/content/scripts/xn-xnote-MailToolbarPalette.js");
    messenger.WindowListener.registerWindow("chrome://messenger/content/messenger.xhtml", "chrome/content/scripts/xn-xnote-overlay.js");
   
   // messenger.WindowListener.registerStartupScript("chrome/content/scripts/xn-startup.js");
  //  messenger.WindowListener.registerShutdownScript("chrome/content/scripts/xn-shutdown.js");

 /*
  * Start listening for opened windows. Whenever a window is opened, the registered
  * JS file is loaded. To prevent namespace collisions, the files are loaded into
  * an object inside the global window. The name of that object can be specified via
  * the parameter of startListening(). This object also contains an extension member.
  */


    messenger.WindowListener.startListening();
}

main();
