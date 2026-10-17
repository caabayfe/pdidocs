var MobileCatalogUtil = Class.create();
MobileCatalogUtil.prototype = {
    initialize: function() {
    },
	
	getCatalogsInPortal: function(portalName) {
		
		if (gs.nil(portalName))
			return {
				value:'',
				displayValue:''
			};
		
		var catalogIDs = [];
		var catalogDisplayNames = [];
		
		var m2mGR = new GlideRecord('m2m_sp_portal_catalog');
		if (m2mGR.isValid()) {
			m2mGR.addActiveQuery();
			m2mGR.addQuery('sp_portal.url_suffix', portalName);
			m2mGR.addQuery('sc_catalog.active', true);
			m2mGR.orderBy('order');
			m2mGR.orderBy('sc_catalog.title');
		}//For old database
		else {
			m2mGR = new GlideRecord('sp_portal');
			m2mGR.addQuery('url_suffix', portalName);
		}
		m2mGR.query();
		
		if (m2mGR.getRowCount() > 0) {
			while(m2mGR.next()) {
				catalogIDs.push(m2mGR.getValue('sc_catalog'));
				catalogDisplayNames.push(m2mGR.getDisplayValue('sc_catalog'));
			}
		} else {
			var catalogGR = new GlideRecord('sc_catalog');
			catalogGR.addActiveQuery();
			catalogGR.addQuery('sys_id', "!=", '0b22fd2ad7021100b9a5c7400e610319');	// Hide Admin Catalog
			catalogGR.orderBy('title');
			catalogGR.query();
			while (catalogGR.next()) {
				catalogIDs.push(catalogGR.getUniqueValue());
				catalogDisplayNames.push(catalogGR.getDisplayValue());
			}
		}
		return {
			value: catalogIDs.join(','),
			displayValue: catalogDisplayNames.join(',')
		};
	},
	
	getCatalogItemTypeNotSupported: function() {
		if (gs.getProperty('glide.sc.mobile.unsupported_discover', 'discover') == 'discover')
			return 'sc_cat_item_wizard';
		
		return 'sc_cat_item_wizard,' + gs.getProperty('glide.sc.mobile.item_class_not_supported');
	},
	
	getItemAvailability: function() {
		if (gs.getProperty('glide.sc.mobile.unsupported_discover', 'discover') == 'discover')
			return "on_desktop,on_mobile,on_both";
		
		if (gs.getProperty('glide.sc.mobile.include_desktop_only_items', 'true') == 'false')
			return "on_mobile,on_both";

		return "on_desktop,on_mobile,on_both";
	},
	
	/**
     * This function removes the "Category is not empty" filter from AIS search source for mobile catalog. The customer can then add the condition for taxonomy attached to MESP. After that the AIS search for mobile will start showing results from the taxonomy associated to MESP.
     * If runManually is false and the record is customised, this function won't change anything and the customer will have to manually remove the condition. If runManually is true, it will update the record even if it has been customised.
     **/
    removeCategoryFilterCondition: function(runManually) {
        var serviceGr = new GlideRecord('ais_search_source');
        if (serviceGr.get('54e1d1e3c7231010d558c943c7c260ca')) { //"Services" AIS Search Source
            if (runManually || !this.isCustomised('ais_search_source_54e1d1e3c7231010d558c943c7c260ca')) {
                serviceGr.condition = serviceGr.condition.replace('^categoryISNOTEMPTY', '');
                serviceGr.update();
            }    
        } else
            gs.info(gs.getMessage("Enable Taxonomy for Mobile: MESP 'Services' search source for AIS not found"));
    },

    isCustomised: function(name) {
        var updateGr = new GlideRecord('sys_update_xml');
        updateGr.addQuery('name', name);
	updateGr.setLimit(1);
        updateGr.query();
        return updateGr.hasNext();
    },
    
	canViewItem: function(catItemId) {
		if (catItemId == null || !GlideStringUtil.isEligibleSysID(catItemId))
			return false;
		
		var catalogItemJS = new sn_sc.CatItem(catItemId);
		
		if (catalogItemJS == null || !catalogItemJS.canView() || !catalogItemJS.isVisibleServicePortal())
			return false;

		var catItemDetails = catalogItemJS.getItemSummary(true, "basic");
		if (!catItemDetails.visible_standalone)
			return false;
		
		if (!this.isItemDiscoverable(catItemDetails))
			return false;
	
		if(catItemDetails.dynamic)
			return false;
		
		return true;
	},
	
	isItemDiscoverable: function(catItemDetails) {
		if (this.getCatalogItemTypeNotSupported().split(',').indexOf(catItemDetails.sys_class_name) > -1)
			return false;
		
		if (this.getItemAvailability().split(',').indexOf(catItemDetails.availability) == -1)
			return false;
		
		return true;
	},
	
	type: 'MobileCatalogUtil'
};
