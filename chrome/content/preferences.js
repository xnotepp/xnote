// encoding='UTF-8'

function onLoad()
{
	chargerEtiquette();
}

function chargerEtiquette()
{
	var n=document.getElementById('etiquette').value;
	var description='mailnews.labels.description.'+n;
	var couleur='mailnews.labels.color.'+n;
	document.getElementById('mailnews.labels.description.4').setAttribute('name', description);
	document.getElementById('mailnews.color.description.4').setAttribute('name', couleur);
	document.getElementById('mailnews.labels.description.4').setAttribute('id', description);
	document.getElementById('mailnews.color.description.4').setAttribute('id', couleur);
	document.getElementById('description-etiquette').setAttribute('preference', description);
	document.getElementById('couleur-etiquette').setAttribute('preference', couleur);
}

/* function savePrefs()
{
	for( var i = 0; i < _elementIDs.length; i++ )
	{
		var elementID = _elementIDs[i];
		var element = document.getElementById(elementID);
		if (!element) break;
		var eltType = element.localName;
		if (eltType == 'radiogroup')
			pref.setIntPref(element.getAttribute('prefstring'), parseInt(element.value));
		else if (eltType == 'checkbox')
			pref.setBoolPref(element.getAttribute('prefstring'), element.checked);
		else if (eltType == 'textbox' && element.preftype == 'int')
			pref.setIntPref(element.getAttribute('prefstring'), parseInt(element.getAttribute('value')) );
		else if (eltType == 'textbox')
		{
			dump('\nelement.preftype='+element.preftype);
			pref.setCharPref(element.getAttribute('prefstring'), element.value);
		}
		else if (eltType == 'menulist')
			pref.setIntPref(element.getAttribute('prefstring'), parseInt(element.getAttribute('value')));
	}
	nsIPrefServiceObj.savePrefFile(null);
}

function onLoad()
{
	var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
	// initialize the default window values...
	for( var i = 0; i < _elementIDs.length; i++ )
	{
		var elementID = _elementIDs[i];
		var element = document.getElementById(elementID);
		if (!element) break;
		var eltType = element.localName;

		if (eltType == 'radiogroup')
		{
			try
			{
				element.selectedItem = element.childNodes[pref.getIntPref(element.getAttribute('prefstring'))];
			}
			catch(e)
			{
				element.selectedItem = element.childNodes[element.getAttribute('defaultpref')];
				try
				{
					pref.setIntPref( element.getAttribute('prefstring'), element.getAttribute('defaultpref') );
				}
				catch (e){}
			}
		}
		else if (eltType == 'checkbox')
		{
			try
			{
				element.checked = ( pref.getBoolPref(element.getAttribute('prefstring')) == true );
			}
			catch(e)
			{
				element.checked = ( element.getAttribute('defaultpref') == true );
				try
				{
					pref.setBoolPref( element.getAttribute('prefstring'), element.getAttribute('defaultpref') );
				}
				catch(e){}
			}
		}
		else if (eltType == 'textbox')
		{
			try
			{
				element.setAttribute('value', pref.getCharPref(element.getAttribute('prefstring')) );
			}
			catch(e)
			{
				element.setAttribute('value', element.getAttribute('defaultpref') );
				try
				{
					var prefstr = document.getElementById('bundle_delAttachMessages').getString(elementID + '_defaultpref')
					element.setAttribute('defaultpref', prefstr )
					element.setAttribute('value', prefstr );
					pref.setCharPref( element.getAttribute('prefstring'), element.getAttribute('defaultpref') );
				} catch(e){}
			}
		}
		else if (eltType == 'menulist')
		{
			try
			{
				element.value = pref.getIntPref(element.getAttribute('prefstring'));
			}
			catch(e)
			{
				element.value = element.getAttribute('defaultpref');
				try
				{
					pref.setIntPref( element.getAttribute('prefstring'), element.getAttribute('defaultpref') );
				}
				catch (e){}
			}
		}
	}
} */
