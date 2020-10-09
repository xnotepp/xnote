
addEventListener("click", async (event) => {
	if (event.target.id.startsWith("register")) {

//	  messenger.Utilities.openLinkExternally("http://sites.fastspring.com/quickfolders/product/quickfolders?referrer=landing-update");
	}
  });


  addEventListener("click", async (event) => {
	if (event.target.id.startsWith("donate")) {

	  messenger.Utilities.openLinkExternally("https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=2AKE2G2B9J3ZS");
	}
  });  


  
	async function loglic() {
/*		
		let name = await messenger.Utilities.getAddonName(),
		    lis = await messenger.Utilities.isLicensed(),		 
		    ver = await messenger.Utilities.getAddonVersion();	
		//console.log ( 		 name);
		//console.log ( 		 lis);
		//console.log ( 		 ver);	
	*/
}





addEventListener("load", async (event) => {
	debugger;
	let text = document.body.innerHTML, 
	htmltext = text.replace(/{addon}/g, await browser.runtime.getManifest().name );    //oder mxUtilties.getAddonName());
	htmltext2 = htmltext.replace(/{version}/g, await browser.runtime.getManifest().version); //oder: browser.runtime.getManifest().version
  
htmltext = htmltext2.replace(/{appver}/g, "TB78");
//same for license,   let htmltext=text.replace(/{addon}/g, await messenger.Utilities.getAddonName());
	document.body.innerHTML = htmltext;

  });  

  loglic();





