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


async function main() {

    
    messenger.WindowListener.registerChromeUrl([ 
        ["content", "xnote", "chrome/content/"],
        ["resource", "xnote", "chrome/"],
        //,
 
        ["locale", "xnote", "en-US", "chrome/locale/en-US/"],
        ["locale", "xnote", "de", "chrome/locale/de/"],
      ]);
 
    messenger.WindowListener.registerOptionsPage("chrome://xnote/content/preferences.xhtml"); 
    
 

    messenger.WindowListener.registerDefaultPrefs("chrome/content/scripts/xn-defaultPrefs.js");

    messenger.WindowListener.registerWindow("chrome://messenger/content/messenger.xul", "chrome/content/scripts/xn-xnote-overlay.js");
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
