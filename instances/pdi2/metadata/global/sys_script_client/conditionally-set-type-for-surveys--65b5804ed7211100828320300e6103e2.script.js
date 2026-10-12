function onLoad() {
	var objView = g_form.getElement('sysparm_view');
	var strView = objView.getAttribute('value'); 
	if (strView == 'survey' && g_form.isNewRecord()) {
		var valueArray = new Array("2e763549d7111100828320300e61038d");
		var labelArray = new Array("survey");
		g_form.setValue("type", valueArray, labelArray);
	}
}
