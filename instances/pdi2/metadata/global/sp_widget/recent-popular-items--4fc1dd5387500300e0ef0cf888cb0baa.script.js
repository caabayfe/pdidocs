(function() {
  /* populate the 'data' object */
	data.limit = options.limit || 8;
	var recent_by = options.recent_by || 'view';
	var recent = new GlideRecord('sp_log');
	if (recent_by === 'view')
		recent.addEncodedQuery('userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^type=Cat Item View^sys_created_onONLast 3 months@javascript:gs.beginningOfLast3Months()@javascript:gs.endOfLast3Months()');
	else
		recent.addEncodedQuery('userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^type=Cat Item Request^sys_created_onONLast 3 months@javascript:gs.beginningOfLast3Months()@javascript:gs.endOfLast3Months()');
	recent.orderByDesc('sys_created_on');
	recent.query();
	var recentItems = [];
	var catalogArr = ($sp.getCatalogs().value + "").split(",");
	data.showPrices = $sp.showCatalogPrices();

	while (recent.next() && recentItems.length < data.limit) {
		if (isAlreadyAdded(recent.getValue('id')))
			continue;
		var catalogItemJS = new sn_sc.CatItem(recent.getValue('id'));
		if (!catalogItemJS.canView(gs.isMobile()) || !catalogItemJS.isVisibleServicePortal())
			continue;
		var item = {};
		var catItemDetails = catalogItemJS.getItemSummary(true);
		if(!catItemDetails.visible_standalone)
			continue;
		var inCatalog = false;
		for (var i=0; i<catItemDetails.catalogs.length; i++) {
			if (catalogArr.indexOf(catItemDetails.catalogs[i].sys_id + "") >= 0) {
				inCatalog = true;
				break;
			}
		}
		if (inCatalog) {
			item.name = catItemDetails.name;
			item.short_description = catItemDetails.short_description;
			item.picture = catItemDetails.picture;
			item.price = catItemDetails.price;
			item.sys_id = catItemDetails.sys_id;
			item.hasPrice = item.price != 0;
			item.page = catItemDetails.type == 'order_guide'? 'sc_cat_item_guide' : 'sc_cat_item';
			recentItems.push(item);
		}
	}

	function isAlreadyAdded(catItemSysId) {
		for (var i=0;i<recentItems.length;i++) {
			if (catItemSysId==recentItems[i].sys_id)
				return true;
		}
		return false;
	}

	data.recentItems = recentItems;

	data.usePopularItemsV2 = (options.use_popular_items_v2 == "true") ? true : false;

	if (data.usePopularItemsV2 && options.popular_items_created != 0) {
		data.popularItemsWidget = $sp.getWidget("sc_popular_items_v2", {
			"popular_items_created": options.popular_items_created,
			"limit": data.limit,
			"use_small_icons": true
		});
	} else
			data.popularItems = getPopularItems();

	function getPopularItems() {
        return new SCPopularItems().useOptimisedQuery(gs.getProperty('glide.sc.portal.popular_items.optimize', true) + '' == 'true')
            .baseQuery(options.popular_items_created + '')
            .allowedItems($sp.getAllowedItems())
            .visibleStandalone(true)
            .visibleServicePortal(true)
            .itemsLimit(options.limit || 8)
            .restrictedItemTypes(['sc_cat_item_guide', 'sc_cat_item_wizard', 'sc_cat_item_content', 'sc_cat_item_producer'])
            .itemValidator(function(item, itemDetails) {
                if (!item.canView(gs.isMobile()) || !item.isVisibleServicePortal())
                    return false;

                return true;
            })
            .responseObjectFormatter(function(item, itemType, itemCount) {
                return {
                    order: 0 - itemCount,
                    name: item.name,
                    short_description: item.short_description,
                    picture: item.picture,
                    price: item.price,
                    sys_id: item.sys_id,
                    hasPrice: item.price != 0,
                    page: itemType == 'sc_cat_item_guide' ? 'sc_cat_item_guide' : 'sc_cat_item'
                };
            })
            .generate();
    }
})();
