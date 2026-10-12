function goToPortal() {
	var id = "";
	if (typeof g_form != "undefined")
		id = g_form.getValue("url_suffix");
	else
		id = getPortalID();
	
	var url = new GlideURL(id);
	window.g_navigation.openPopup(url.getURL(), 'try_portal_' + id, '', false);
}

function getPortalID() {
	var spGR = new GlideRecord("sp_portal");
	spGR.get(g_sysId);
	return spGR.getValue("url_suffix");
}
