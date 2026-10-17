function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == '' || isLoading)
		return;

	var name = newValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

	// Compact any multiple sequential underscores
	while (name.indexOf("__") != -1) 
		name = name.replace(/__/g, "_");

	// Replace any trailing underscores
	while (name != '' && name.charAt(name.length - 1) == '_') 
		name = name.substring(0, name.length - 1);
	
	if (newValue != name) {
		g_form.setValue("url_suffix", name);
		return;
	}

	var portal = new GlideRecord("sp_portal");
	portal.addQuery("url_suffix", g_form.getValue("url_suffix"));
	portal.addQuery("sys_id", "!=", g_form.getUniqueValue());
	portal.query(portalCallback);
	
	var site = new GlideRecord("content_site");
	site.addQuery("url_suffix", g_form.getValue("url_suffix"));
	site.query(siteCallback);
}

function portalCallback(portal) {
	if (portal.next()) {
		g_form.showErrorBox("url_suffix", "URL suffix already exists, use a different suffix");
		return;
	}
}

function siteCallback(site) {
	if (site.next()) {
		g_form.showErrorBox("url_suffix", "URL suffix is used by a CMS site, try a different suffix");
		return;
	}
}
