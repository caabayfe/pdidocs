(function() {
    data.loading = true;
    data.load_config = options.load_config;
    data.asyncLoad = options.async_load || false;
    data.listType = options.list_type;
    data.cardType = (data.listType === "card_list") ? options.card_behaviour + "" : "";
    data.favNavigation = "?id=favorites_list&sortBy=" + options.sort_order;
    data.favoriteTitle = gs.getMessage("My favorites");
    data.favoriteCountForWidget = options.visible_favorites;
    if (data.load_config === "Async" && !input && !data.asyncLoad)
        return;

    var grInstanceRecord = $sp ? $sp.getInstanceRecord() : '';
    var instanceId = grInstanceRecord ? grInstanceRecord.getUniqueValue() : '';
    var stats = {};
    stats.callerId = instanceId;
    stats.textPrefix = 'Your Favorites';
    stats.startTime = new GlideDateTime();
    stats.shortDesc = 'Load Data';
    stats.guid = gs.generateGUID();

    data.showEmptyState = options.show_empty_state === "true" ? 1 : 0;
    var portalId = $sp.getPortalRecord().getUniqueValue();
    var favoritePage = new sn_ex_sp.FavoritesPage(portalId);
    var qsConfig = $sp.getValue('quick_start_config');
    var favoriteIcon = new sn_ex_sp.FavoriteAPI().getFavoriteIcon(qsConfig);
    data.emptyStateIcon = favoriteIcon.checkIcon;
    data.sortBy = options.sort_order;
    data.contentList = favoritePage.getAllFavoritesWithContent(0, data.favoriteCountForWidget, true, '', data.sortBy, instanceId, stats.guid);
    data.noOfCards = data.contentList.length;
    data.isCarouselView = data.listType === "card_list" && data.cardType === "single";
    data.loading = false;

    new sn_ex_sp.PerformanceIndicatorUtil().postInstanceHotspot(stats);

    data.contentList.map(function(content) {
        content.cardWidget = $sp.getWidget('your_favorite_content_card', {
            'table': content.tableName,
            'sysId': content.sysId,
            'listType': data.listType,
            'iconClass': content.iconClass,
            'primaryField': content.primaryField,
            'type': content.type,
            'favoriteTitle': data.favoriteTitle,
            'url': content.url,
            'target': content.target
        });
    });

})();
