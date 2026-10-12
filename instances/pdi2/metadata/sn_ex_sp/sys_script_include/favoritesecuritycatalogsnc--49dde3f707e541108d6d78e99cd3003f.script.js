var FavoriteSecurityCatalogSNC = Class.create();
FavoriteSecurityCatalogSNC.prototype = {
    initialize: function() {},

    /**
     * Return true if the favorite is visible on portal
     * @parm gr - GlideRecord - The original record that is favorited by the user
     * @return boolean
     */
    canView: function(gr, isMobile) {
        if (!gr.isValidRecord())
            return false;
        var catalogItemId = gr.getUniqueValue();
        if (catalogItemId == null)
            return false;
        var catalogItemJS = new sn_sc.CatItem(catalogItemId);
        if (catalogItemJS == null || !catalogItemJS.canView() || !catalogItemJS.isVisibleServicePortal())
            return false;
		if(isMobile){
			var catItemDetails = catalogItemJS.getItemSummary(true, "basic");
			return this.isItemDiscoverable(catItemDetails);
		}
		return true;
    },

    /**
     * Checks if current catalog item is discoverable
     * @param Object - catItemDetails
     * @return Boolean
     */
    isItemDiscoverable: function(catItemDetails) {
        if (this.getItemAvailability().split(',').indexOf(catItemDetails.availability) == -1)
            return false;
        return true;
    },

    /**
     * Checks sys properties for unsupported discover and desktop and mobile only
     * @return String
     */
    getItemAvailability: function() {
        if (gs.getProperty('glide.sc.mobile.unsupported_discover', 'discover') == 'discover')
            return "on_desktop,on_mobile,on_both";
        if (gs.getProperty('glide.sc.mobile.include_desktop_only_items', 'true') == 'false')
            return "on_mobile,on_both";
        return "on_desktop,on_mobile,on_both";
    },

    /**
     * Return true if this extension point is to be run
     * @return boolean
     */
    applies: function(gr) {
        var table = new GlideTableHierarchy(gr.sys_class_name);
        var tables = table.getTables();
        return tables.indexOf("sc_cat_item") > -1;
    },

    type: 'FavoriteSecurityCatalogSNC'
};
