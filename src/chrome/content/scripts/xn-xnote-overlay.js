var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

Services.scriptloader.loadSubScript("chrome://xnote/content/xnote-dateformat.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://xnote/content/xnote-classe.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://xnote/content/xnote-overlay.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://xnote/content/xnote-columnnote.js", window, "UTF-8");
//Services.scriptloader.loadSubScript("chrome://global/content/preferencesBindings.js", window, "UTF-8");
//Services.scriptloader.loadSubScript("chrome://xnote/content/preferences.js", window, "UTF-8");


function onLoad(activatedWhileWindowOpen) {
    console.log (Services.appinfo.version);
    let layout = WL.injectCSS("chrome://xnote/content/skin/xnote-overlay.css");
    let str1="clicBouton";
    WL.injectElements(`

    <toolbar id="mail-bar3">
    <toolbarbutton
    id="xnote-toolbar-button"
    class="toolbarbutton-1 chromeclass-toolbar-additional"
                            label="&xnote.label;"
                            disabled="false"
    oncommand="xnote.ns.Overlay.initialise('clicBouton');">
  </toolbarbutton>

  </toolbar>  

    <stringbundleset id="xnote-stringbundleset">
    <stringbundle id="xnote-stringbundle-overlay" src="chrome://xnote/locale/xnote-overlay.properties"/>
    </stringbundleset>
    
    <!-- Context menu for message list -->
    <popup id="mailContext">
    <menu id="xnote-mailContext-xNote" label="&xnote.label;" accesskey="&xnote.key;"
              image="chrome://xnote/content/skin/xnote_context.png" class="menuitem-iconic"
              insertbefore="mailContext-openInBrowser,mailContext-openNewWindow">
        <menupopup>
             <menuitem id="xnote-context-create" label="&ajout.label;" accesskey="&ajout.key;"
                oncommand="xnote.ns.Overlay.context_createNote();">
            </menuitem>
            <menuitem id="xnote-context-modify" label="&modif.label;" accesskey="&modif.key;"
                oncommand="xnote.ns.Overlay.context_modifyNote();">
            </menuitem>
            <menuitem id="xnote-context-delete" label="&suppr.label;" accesskey="&suppr.key;"
                oncommand="goDoCommand('cmd_label0'); xnote.ns.Overlay.context_deleteNote();">
      <!--
        It seems the observes element is no longer working as of TB 68.
        Disabling now via JavaScript.
      -->
                <observes element="xnote-context-modify" attribute="hidden"/>
            </menuitem>
           
            
    <menuseparator id="xnote-context-separator-after-delete">
      <observes element="xnote-context-modify" attribute="hidden" />
    </menuseparator>
    <menuitem id="xnote-context-reset-note-window" label="&resetNoteWindow.label;"
      oncommand="xnote.ns.Overlay.context_resetNoteWindow();">
      <observes element="xnote-context-modify" attribute="hidden"/>
    </menuitem>
        </menupopup>
    </menu>
    <menuseparator id="xnote-mailContext-sep-xNote" insertbefore="mailContext-openInBrowser,mailContext-openNewWindow"/>
    </popup>
    
    <tree id="threadTree">
    <treecols id="threadCols">
    <splitter class="tree-splitter" />
    <treecol id="xnoteCol" persist="hidden ordinal width" label="&xnote.label;"
       currentView="unthreaded" is="treecol-image" 
       class="treecol-image xnote-column-header" tooltiptext="&header.label;" />
    </treecols>
    </tree>
  
  `, ["chrome://xnote/locale/xnote-overlay.dtd"]);

window.xnote.WL = WL;  
window.xnote.ns.Overlay.onLoad();
window.xnote.ns.ColumnNote.doOnceLoaded();
//window.xnote.ns.Preferences.setNewPrefs();
}

function onUnload(isAddOnShutDown) {
 

  }

