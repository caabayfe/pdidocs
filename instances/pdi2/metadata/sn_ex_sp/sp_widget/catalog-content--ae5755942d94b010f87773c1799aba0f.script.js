(function() {
    var catalogSysId = options.content;
    var catalogTable = options.content_table;
    var widgetTitle = options.widgetTitle;
    var widgetSysId = options.widgetSysId;
    var isFeatured = options.isFeatured || false;
    var viewType = options.listType || 'card';
    var index = options.index;
    var CONTENT_TYPES = {
        KB: 'kb',
        EXTERNAL: 'external',
        DYNAMIC: 'dynamic'
    };
    var TYPES = {
        ORDER_GUIDE: 'order_guide',
        CONTENT_ITEM: 'content_item'
    };
    var searchModeEnabled = options.searchModeEnabled || false;
    var CARD_DATA_SOURCE = {};
    if (searchModeEnabled) {
        CARD_DATA_SOURCE = options;
        var type = "";
        var content_type = "";
        var kb_article = "";
        for (var i = 0; i < options.columns.length; i++) {
            if (options.columns[i].fieldName === "sys_class_name") {
                type = options.columns[i].value;
            } else if (options.columns[i].fieldName === "content_type") {
                content_type = options.columns[i].value;
            } else if (options.columns[i].fieldName === "kb_article") {
                kb_article = options.columns[i].value;
            }
        }

        if (type === 'sc_cat_item_guide') {
            CARD_DATA_SOURCE.type = TYPES.ORDER_GUIDE;
        } else if (type === "sc_cat_item_content") {
            CARD_DATA_SOURCE.type = TYPES.CONTENT_ITEM;
        }
        CARD_DATA_SOURCE.content_type = content_type;
        CARD_DATA_SOURCE.kb_article = kb_article;
    } else {
        if (!catalogSysId || !catalogTable)
            return;
        var catalogItemJS = new sn_sc.CatItem(catalogSysId);
        CARD_DATA_SOURCE = catalogItemJS.getItemSummary();
    }

    var catItemDetails = CARD_DATA_SOURCE;
    var additionalInfo = '';
    var zeroRecurringPriceVal = '0.00';
    //to check if the catalog item has price and also 'glide.sc.price.display' property value
    if (catItemDetails.show_price && $sp.showCatalogPrices()) {
        additionalInfo = catItemDetails.price;
        if (!searchModeEnabled) {
            var isRecurringPriceNonZero = catItemDetails.recurring_price && catItemDetails.recurring_price.substr(1, 4) !== zeroRecurringPriceVal;
            if (catItemDetails.recurring_frequency && catItemDetails.recurring_frequency !== null && isRecurringPriceNonZero)
                additionalInfo = additionalInfo + ' + ' + catItemDetails.recurring_price + '/' + catItemDetails.recurring_frequency;
        }
    }
    var page = catalogTable;
    //use kb article sys_id instead of catalog record sys_id if it is a kb article type catalog
    var sys_id = catItemDetails.content_type === CONTENT_TYPES.KB ? catItemDetails.kb_article : catItemDetails.sys_id;
    //for the external type catalog, open the catalog item in new tab
    var target = catItemDetails.content_type === CONTENT_TYPES.EXTERNAL ? '_blank' : '';
    
	//page ids differ for order guide and kb article type catalog items
    if (catItemDetails.type === TYPES.ORDER_GUIDE) {
        page = 'sc_cat_item_guide';
    } else if (catItemDetails.type === TYPES.CONTENT_ITEM && catItemDetails.content_type === CONTENT_TYPES.KB) {
        page = 'kb_article';
    }

    var defaultUrl = '?id=' + page + '&sys_id=' + sys_id;
    var pageUrl = catItemDetails.type === TYPES.CONTENT_ITEM && catItemDetails.content_type === CONTENT_TYPES.EXTERNAL ?
        catItemDetails.url : catItemDetails.type === TYPES.CONTENT_ITEM && catItemDetails.content_type === CONTENT_TYPES.DYNAMIC ?
        getUrlForDynamicContentItem(catItemDetails, defaultUrl) : defaultUrl;


    var image = catItemDetails.picture ? catItemDetails.picture + '?t=small' : '';

    data.catalogCardData = {
        sysId: catalogSysId,
        widgetTitle: widgetTitle,
        widgetSysId: widgetSysId,
        title: catItemDetails.name,
        description: catItemDetails.short_description,
        type: gs.getMessage('request'),
        isFeatured: isFeatured,
        image: image,
        iconClass: 'fa fa-pencil-square-o',
        target: target,
        additionalInfo: additionalInfo,
        url: pageUrl,
        viewType: viewType,
        table: catalogTable,
        index: index
    };

    data.widgetData = $sp.getWidget("content-card", data.catalogCardData);

    function getUrlForDynamicContentItem(catItemDetails, defaultUrl) {
        var dynamicContentItemConfig = catItemDetails.dynamic;
        var url;
        try {
            url = dynamicContentItemConfig ? new global.DynamicCatalogContentUtil().getServicePortalUrl(dynamicContentItemConfig.model, dynamicContentItemConfig.content) : defaultUrl;
        } catch (e) {
            url = defaultUrl;
        }
        return url;
    }

})();
