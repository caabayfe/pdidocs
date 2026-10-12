(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */
    var catalogIDArr = $sp.getCatalogs().value.split(',');
    var allowedItems = getAllowedCatalogItems();
    var UserRecommendationUtil = new sn_hr_sp.UserRecommendationUtil();
    data.users = options.users;
    data.title = gs.getMessage("Catalog Items");
    var displayCount = 3;
    data.sysId = $sp.getParameter('sys_id') || options.ariaLabelId;
    var response = {};
    var catalogPayload = {
        users: null,
        allowedItems: allowedItems,
        catalogCount: displayCount,
        ignoredCatalogs: null,
        recentActivityCutoffDate: options.recentActivityCutoffDate
    };
    if (GlidePluginManager.isActive('com.glide.platform_ml') && GlidePluginManager.isActive('com.sn_hr_core') && data.users && data.users.length > 0) {
        catalogPayload.users = data.users;
        response = UserRecommendationUtil.getCatalogItems(catalogPayload);
        if (response.length < displayCount) {
            var mostPopulartCatItemCount = displayCount - response.length;
            var catalogItemsToIgnore = [];
            for (var i = 0; i < response.length; i++) {
                catalogItemsToIgnore.push(response[i].sys_id);
            }
            catalogPayload.users = null;
            catalogPayload.catalogCount = mostPopulartCatItemCount;
            catalogPayload.ignoredCatalogs = catalogItemsToIgnore;
            var popularItems = UserRecommendationUtil.getCatalogItems(catalogPayload);
            response = response.concat(popularItems);

        }
        data.results = response;
    } else
        data.results = UserRecommendationUtil.getCatalogItems(catalogPayload);

    function getAllowedCatalogItems() {
        var allowedItems = [];
        catalogIDArr.forEach(function(catalogID) {
            var catalogObj = new sn_sc.Catalog(catalogID);
            var catItemIds = catalogObj.getCatalogItemIds();
            for (var i = 0; i < catItemIds.length; i++) {
                if (allowedItems.indexOf(catItemIds[i]) == -1)
                    allowedItems.push(catItemIds[i]);
            }
        });
        return allowedItems;
    }

})();
