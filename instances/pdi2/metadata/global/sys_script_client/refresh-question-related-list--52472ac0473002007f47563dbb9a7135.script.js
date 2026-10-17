function onLoad() {
	refreshRelatedList();
}

function refreshRelatedList(){
	if (g_form.getBooleanValue('enable_socialqa'))
	   g_form.showRelatedList('REL:c4239280473002007f47563dbb9a719e');
	else
		g_form.hideRelatedList('REL:c4239280473002007f47563dbb9a719e');
}
