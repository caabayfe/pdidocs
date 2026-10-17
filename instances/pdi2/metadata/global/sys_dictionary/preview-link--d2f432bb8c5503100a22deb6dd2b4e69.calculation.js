calcItemPreview(current);
function calcItemPreview(current) {
	var popScript = '';
	// Called during zboot so check scriptable object available
	if (typeof(GlideappCatalogURLGenerator) !== 'undefined' && typeof(GlideappCatalogURLGenerator.getItemBaseURLFromGR) === 'function') {
		var url = GlideappCatalogURLGenerator.getItemBaseURLFromGR(current);
		if(url.indexOf('?') != -1)
			url += '&sysparm_preview=true';
		else
			url += '?sysparm_preview=true';
		popScript = 'JavaScript: popupOpenStandard("' + url + '", "summary");';
	}
	return popScript;
}
