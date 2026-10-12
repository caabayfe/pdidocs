var UrlUnfurlingUtils = Class.create();
UrlUnfurlingUtils.prototype = {

	CARD_PRIORITY_LIST: [["video_link", "UnfurlingVideoCard"],
						["image_link", "UnfurlingImageCard"],
						["url", "UnfurlingBaseCard"]],

	DEFAULT_FAVICON_ICON_PATH: "/favicon.ico",

	initialize: function() {
	},

	/*
	 * Given a map of unfurled data from a URL, find out which adapter card template to apply to show the URL card.
	 */
	getTemplateType: function(tagMap) {
		for (var i = 0; i < this.CARD_PRIORITY_LIST.length; i++) {
			if (!gs.nil(tagMap[this.CARD_PRIORITY_LIST[i][0]])) {
				return this.CARD_PRIORITY_LIST[i][1];
			}
		}
		return null;
	},

	/*
	 * If favicon is not found or points to a relative path, use the default favicon URL location for the site.
	 */
	updateFavicon: function(tagMap) {
		if (gs.nil(tagMap["fav_icon"]) || tagMap["fav_icon"].startsWith("/"))
			return this.getDefaultFavicon(tagMap);
		return tagMap["fav_icon"];
	},

	/*
	 * Get the default favicon location for the site.
	 */
	getDefaultFavicon: function(tagMap) {
		var url = tagMap["url"];
		if (gs.nil(url))
			return null;

		var allowedHostnameHelperApi = new AllowedHostnameHelper();
		var hostname = allowedHostnameHelperApi.extractHostnameFromURLWithProtocol(url);

		var siteFaviconUrl = hostname + this.DEFAULT_FAVICON_ICON_PATH;
		return siteFaviconUrl;
	},

	type: 'UrlUnfurlingUtils'
};
