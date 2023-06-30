var Services = globalThis.Services || ChromeUtils.import(
  "resource://gre/modules/Services.jsm"
).Services;

// Load xnoteOverlayObj into the window.
Services.scriptloader.loadSubScript("chrome://xnote/content/xnote-overlay.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://xnote/content/xnote-columnnote.js", window, "UTF-8");

function onLoad(activatedWhileWindowOpen) {
  //console.log (Services.appinfo.version);
  let layout = WL.injectCSS("resource://xnote/skin/xnote-overlay.css");
  WL.injectElements(`

    <stringbundleset id="xnote-stringbundleset">
      <stringbundle id="xnote-stringbundle-overlay" src="chrome://xnote/locale/xnote-overlay.properties"/>
    </stringbundleset>
    <browser id ="xnote-print" insertbefore = "messagepane"  type = "content" hidden = "true"/>
    <!-- Context menu for message list -->
    <popup id="mailContext">
    <menu id="xnote-mailContext-xNote" label="&xnote.label;" accesskey="&xnote.key;"
              image="resource://xnote/skin/xnote_context.png" class="menuitem-iconic"
              insertbefore="mailContext-openInBrowser,mailContext-openNewWindow">
        <menupopup>
             <menuitem id="xnote-context-create" label="&ajout.label;" accesskey="&ajout.key;"
                oncommand="window.xnoteOverlayObj.context_createNote();">
            </menuitem>
            <menuitem id="xnote-context-modify" label="&modif.label;" accesskey="&modif.key;"
                oncommand="window.xnoteOverlayObj.context_modifyNote();">
            </menuitem>
            <menuitem id="xnote-context-delete" label="&suppr.label;" accesskey="&suppr.key;"
                oncommand="goDoCommand('cmd_label0'); window.xnoteOverlayObj.context_deleteNote();">
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
      oncommand="window.xnoteOverlayObj.context_resetNoteWindow();">
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
       class="treecol-image xnote-column-header" tooltiptext="&header.label;"
       src = "resource://xnote/skin/xnote_context.png" />
    </treecols>
    </tree>
  
  `, ["chrome://xnote/locale/xnote-overlay.dtd"]);

  window.xnoteColumnObj.onLoad();
  window.xnoteOverlayObj.onLoad();

  // Taken from full-address-column@lukasz.kosson.net / Full Address column
  // Usually the column handler is added when the window loads.
  // In our setup it's added later and we may miss the first notification.
  // So we fire one ourserves.
  if (window.gDBView && window.document.documentElement.getAttribute("windowtype") == "mail:3pane") {
    Services.obs.notifyObservers(null, "MsgCreateDBView");
  }
}

function onUnload(isAddOnShutDown) {
  window.xnoteColumnObj.onUnload();
  window.xnoteOverlayObj.onUnload();
}
