var SitemapIndexFileUrlDetails = Class.create();
SitemapIndexFileUrlDetails.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	getSitemapURL: function() {
		
		// retrieve the `sitemapConfigId` from the param
		var sitemapConfigId = this.getParameter("sysparm_sitemap_config_id");
		var result = null;

		// Copy the sitemap index file url
		var baseUrl = gs.getProperty("glide.servlet.uri");
		if (baseUrl)
			baseUrl = baseUrl.slice(0, -1);

		var sitemapURL = baseUrl + '/sitemap.do?sitemapConfigId=' + sitemapConfigId;

		var fileNameFound = false;
		var sa = new sn_ux_seo_sitemap.SitemapAttachment();
		var attachment = sa.getAttachment(sitemapConfigId);
		if (attachment != null) {
			fileNameFound = true;
		}

		if (fileNameFound === true) {
			result = {
				"response": "valid",
				"message": "Successfully copied the Sitemap URL.",
				"sitemapURL": sitemapURL
			};
		} else {
			result = {
				"response": "invalid",
				"message": "Unable to copy the Sitemap URL. There are no attachments available.",
				"sitemapURL": null
			};
		}
		return JSON.stringify(result);
	},
	isPublic: function() {
		return false;
	},
    type: 'SitemapIndexFileUrlDetails'
});
