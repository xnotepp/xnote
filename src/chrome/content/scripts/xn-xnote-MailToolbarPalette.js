var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");



function onLoad(activatedWhileWindowOpen) {
    console.log (Services.appinfo.version);
//    let layout = WL.injectCSS("chrome://xnote/content/skin/xnote-overlay.css");
   WL.injectElements(`

   <!-- Toolbar button -->

  <toolbarpalette id="MailToolbarPalette">
  			<toolbarbutton
				id="xnote-toolbar-button"
				class="toolbarbutton-1 chromeclass-toolbar-additional"
                                label="&xnote.label;"
                                disabled="false"
        oncommand="xnote.ns.Overlay.initialise('clicBouton');">
			</toolbarbutton>

      

      		</toolbarpalette>


  `, ["chrome://xnote/locale/xnote-overlay.dtd"]);

}

function onUnload(isAddOnShutDown) {
 

  }

