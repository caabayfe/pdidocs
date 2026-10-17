function onCopySitemapURLBtnClick() {
	var sitemapConfigId = g_form.getUniqueValue();
	// Call the script include `SitemapIndexFileUrlDetails` with param `sitemapConfigId` to fetch the sitemap url
	var ga = new GlideAjax('SitemapIndexFileUrlDetails'); 
	ga.addParam('sysparm_name','getSitemapURL');
	ga.addParam('sysparm_sitemap_config_id', sitemapConfigId);
	ga.getXMLAnswer(copySitemapURL);
	
}

// the callback function for returning the result from script include `SitemapIndexFileUrlDetails`
function copySitemapURL(response) {
	var result = JSON.parse(response);
	if (result != null) {
		if (result.response === "valid" && result.sitemapURL != null) {
			copyToClipboard(result.sitemapURL);
      g_form.addInfoMessage(getMessage("Successfully copied the Sitemap URL."));
		} else {
      g_form.addInfoMessage(getMessage("Unable to copy the Sitemap URL. There are no attachments available."));
		}
	}
}
