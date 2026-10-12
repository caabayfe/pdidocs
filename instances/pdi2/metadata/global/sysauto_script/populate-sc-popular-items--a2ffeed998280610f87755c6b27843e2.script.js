function getPopularItems(time_period, allowedItems) {
    return new SCPopularItems().useOptimisedQuery(true)
        .baseQuery(time_period)
        .allowedItems(allowedItems)
        .visibleStandalone(true)
        .visibleServicePortal(true)
        .itemsLimit(ITEM_LIMIT)
        .checkRestrictedTypes(true)
        .restrictedItemTypes(['sc_cat_item_guide'])
        .itemValidator(function(item, itemDetails) {
			return item.isActive();
        })
        .responseObjectFormatter(function(item, itemType, itemCount) {
            return {
                count: itemCount || 0,
                sys_id: item.sys_id || ''
            };
        })
        .generate();
}

function insertRecords(time_period, popularItemsArr, catalogId) {
	for (var i = (popularItemsArr.length - 1); i >= 0; i--) {
		var item = popularItemsArr[i];
		if (Object.keys(item).length == 0 || !GlideStringUtil.isEligibleSysID(item.sys_id))
			continue;
			
		var popularItems = new GlideRecord("sc_popular_items");
		popularItems.initialize();
		popularItems.setValue("sc_cat_item", item.sys_id);
		popularItems.setValue("request_count", item.count);
		popularItems.setValue("time_period", time_period);
		popularItems.setValue("sc_catalog", catalogId);
		popularItems.insert();
	}	
}

function deletePopularItems() {
	var popularItems = new GlideRecord("sc_popular_items");
	popularItems.query();
	popularItems.deleteMultiple();
}

var ITEM_LIMIT = 200;
var catalogJS;
var allowedItems;
var time_periods = [3, 6, 12];
deletePopularItems();
var catalogGR = new GlideRecord("sc_catalog");
catalogGR.addActiveQuery();
catalogGR.query();
while (catalogGR.next()) {
	catalogJS = new sn_sc.Catalog(catalogGR.getUniqueValue());
	allowedItems = catalogJS.getCatalogItemIds();
	for (var i = 0; i < time_periods.length; i++)
		insertRecords(time_periods[i], getPopularItems(time_periods[i], allowedItems), catalogGR.getUniqueValue());
}
