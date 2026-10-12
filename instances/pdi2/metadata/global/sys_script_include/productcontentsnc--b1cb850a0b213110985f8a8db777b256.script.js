var ProductContentSNC = Class.create();
ProductContentSNC.prototype = {
    initialize: function() {
    },

	canSyncWithCDN: function() {
		return SNC.ProductContentDownloader.canSyncWithProductCDN();
	},

	refreshContent: function(contentPath, fileName) {
		try {
			return SNC.ProductContentDownloader.refreshXMLContent(contentPath, fileName);
		} catch (err) {
			gs.info("Error in updating Product Content: " + err);
			return false;
		}
	},

    type: 'ProductContentSNC'
};
