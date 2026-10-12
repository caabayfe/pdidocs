function goToPage2() {
	var id = "";
	if (typeof g_form != "undefined")
		id = g_form.getValue("id");
	else
		id = getSPID2();
	
	var dd = new GlideDialogWindow('try_portal_page');
    dd.setTitle('Try Portal Page (select portal)');
    dd.setPreference('portal_page_id', id);
    dd.render();

	//var url = new GlideURL('$sp.do');
	//url.addParam('id', id);
	//var w = getTopWindow();
	//w.popupOpenFocus(url.getURL(), 'try_portal_page', 950, 700, '', false, false);
}

function getSPID2() {
	var spGR = new GlideRecord("sp_page");
	spGR.get(g_sysId);
	return spGR.getValue("id");
}
