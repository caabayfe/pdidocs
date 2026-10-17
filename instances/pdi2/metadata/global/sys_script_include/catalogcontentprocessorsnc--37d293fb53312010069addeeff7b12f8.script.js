var CatalogContentProcessorSNC = Class.create();
CatalogContentProcessorSNC.prototype = {
    /**
     * Returns the table name of content which is processed
     * @return String
     */
    getTableName: function() {
        return 'sc_cat_item';
    },

    /**
     * Returns true or false whether a user has access to view the content record
     * @param String - catalogItemId
     * @param String - userId
     * @param boolean - isMobile
     * @return Boolean
     */
    canView: function(catalogItemId, userId, isMobile) {
        if (catalogItemId == null)
            return false;
        var catalogItemJS = new sn_sc.CatItem(catalogItemId);
        if (catalogItemJS == null || !catalogItemJS.canView())
            return false;
        if (!isMobile && !catalogItemJS.isVisibleServicePortal())
            return false;

        // check for catalog item visibility while evaluating the visibility for now mobile only
        if (isMobile){
            var mobileCatalogUtil = new sn_scmobile.MobileCatalogUtil();
            if (!mobileCatalogUtil.canViewItem(catalogItemId))
                return false;
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
     * Returns popularity of content, which is used to order the content while displaying
     * @param String - comma separated content sys_id's
     * @return Object
     */
    getPopularity: function(catItemIds) {
        var catItems = catItemIds.split(',');
        var contentPopularityMap = {};

        var recentActivityCutoffDate;
        var recentActivityCutoffInDays = gs.getProperty('recent.activity.cutoff.days');
        if(!gs.nil(recentActivityCutoffInDays)) {
            recentActivityCutoffDate = new GlideDateTime();
            recentActivityCutoffDate.addDaysLocalTime(-recentActivityCutoffInDays);
        }
        var catItemPopularity = this._getPopularityForCatItems(catItems, recentActivityCutoffDate);
        var recordProducerPopularity = this._getPopularityForRecordProducers(catItems, recentActivityCutoffDate);

        catItems.forEach(function(item) {
            var popularity = 0;
            if (catItemPopularity.hasOwnProperty(item))
                popularity = catItemPopularity[item];
            else if (recordProducerPopularity.hasOwnProperty(item))
                popularity = recordProducerPopularity[item];
            contentPopularityMap[item] = popularity;
        });

        return contentPopularityMap;
    },

    _getPopularityForCatItems: function(catItems, recentActivityCutoffDate) {
        var popularityMap = {};
        var reqItemGr = new GlideAggregate('sc_req_item');
        reqItemGr.setCategory("catalog_meta");
        reqItemGr.addAggregate('COUNT', 'cat_item');
        reqItemGr.groupBy('cat_item.sys_id');
        reqItemGr.addQuery('cat_item', 'IN', catItems);
        reqItemGr.addQuery('cat_item.sys_class_name', 'NOT IN', 'sc_cat_item_guide,sc_cat_item_wizard,sc_cat_item_content,sc_cat_item_producer');
        reqItemGr.addQuery('cat_item.visible_standalone', 'true');
        if(!gs.nil(recentActivityCutoffDate)) {
            reqItemGr.addQuery('sys_created_on', '>=', recentActivityCutoffDate);
            reqItemGr.addEncodedQuery('cat_item.hide_sp=false^ORcat_item.hide_spISEMPTY');
        } else {
            var createdQuery = this._getCreatedQuery();
            reqItemGr.addEncodedQuery(createdQuery + 'cat_item.hide_sp=false^ORcat_item.hide_spISEMPTY');
        }
        reqItemGr.query();
        while (reqItemGr.next())
            popularityMap[reqItemGr.getValue('cat_item.sys_id')] = parseInt(reqItemGr.getAggregate('COUNT', 'cat_item'));
        return popularityMap;
    },

    _getPopularityForRecordProducers: function(recordProducers, recentActivityCutoffDate) {
        var popularityMap = {};
        var recProGr = new GlideAggregate('sc_item_produced_record');
        recProGr.setCategory("catalog_meta");
        recProGr.addAggregate('COUNT', 'producer');
        recProGr.groupBy('producer.sys_id');
        recProGr.addQuery('producer', 'IN', recordProducers);
        recProGr.addQuery('producer.visible_standalone', 'true');
        if(!gs.nil(recentActivityCutoffDate)) {
            recProGr.addQuery('sys_created_on', '>=', recentActivityCutoffDate);
            recProGr.addEncodedQuery('producer.hide_sp=false^ORproducer.hide_spISEMPTY');
        } else {
            var createdQuery = this._getCreatedQuery();
            recProGr.addEncodedQuery(createdQuery + 'producer.hide_sp=false^ORproducer.hide_spISEMPTY');
        }
        recProGr.query();
        while (recProGr.next())
            popularityMap[recProGr.getValue('producer.sys_id')] = parseInt(recProGr.getAggregate('COUNT', 'producer'));
        return popularityMap;
    },

    _getCreatedQuery: function() {
        return 'sys_created_onONLast 6 months@javascript:gs.beginningOfLast6Months()@javascript:gs.endOfLast6Months()^';
    },

    /**
     * Returns if the the content passes the specified filter conditions for content authoring experience
     * @return Boolean
     */
    isContentAuthoringAllowed: function(record) {
        return record.isValidRecord() && record.canWrite();
    },

    getCategoryFieldsMap: function() {
        var categoryFieldsMap = {};
        categoryFieldsMap['category'] = 'catalog_item';
        categoryFieldsMap['categoryColumn'] = 'sc_category';
        categoryFieldsMap['categoryLabel'] = 'title';
        categoryFieldsMap['categoryParent'] = 'sc_catalog';
        return categoryFieldsMap;
    },

    type: 'CatalogContentProcessorSNC'
};
