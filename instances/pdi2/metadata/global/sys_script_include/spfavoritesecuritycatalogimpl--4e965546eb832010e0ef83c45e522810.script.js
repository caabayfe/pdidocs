var SPFavoriteSecurityCatalogImpl = Class.create();
SPFavoriteSecurityCatalogImpl.prototype = {
    initialize: function() {
    },
	
	/* return if the record is visible in the protal */
    canView: function(/*GlideRecord*/ gr, /*SysID*/portalID) {
		var catalogs = new GlideSPScriptable(portalID).getCatalogs().value;
		var inCatalog = false;
		
		if (!GlideappCatalogItem.get(gr.getUniqueValue()).canView())
			return false;
		
		if (gr.getValue('sc_catalogs')) {
			gr.getValue('sc_catalogs').split(',').forEach (function (catalog) {
				if (catalogs.indexOf(catalog) > -1) {
					inCatalog = true;
					return false;
				}
			});
		}

		if (inCatalog) {
			return (gr.getValue('active') == true && 
					gr.getValue('visible_standalone') == true && 
					gr.getValue('hide_sp') != true);
		}
		return false;
    },
	
	/* return true if this extension point is to be run */
	applies: function(/*GlideRecord*/ gr) {
		return gr.instanceOf('sc_cat_item');
	},

    type: 'SPFavoriteSecurityCatalogImpl'
};
