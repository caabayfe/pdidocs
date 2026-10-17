(function() {

    data.draftDeleteEventName = "ec_requests.deleteDraft";
    data.screenId = sn_ex_sp.RequestConstants.DEFAULT_SCREENS.REQUEST_DETAIL;

    data.uiFilters = options.uiFilters || {};
    data.tabId = options.tabId;
    data.searchParam = options.searchParam;
    data.limit = parseInt(options.limit);
    const portalId = $sp.getDisplayValue("sys_id");
    const requestUtil = new sn_ex_sp.RequestUtil(portalId);
    data.isDraftTab = data.tabId == options.draftTabId;
    data.offset = 0;
    data.showMoreButtonText = gs.getMessage("Show more requests");
    data.clearFilterText = gs.getMessage("Clear filters");
    data.clearSearchText = gs.getMessage("Clear search");

    data.mespRequestCard = $sp.getWidget("mesp-request-card", {});
    data.mespRequestSkeletonLoader = $sp.getWidget("me-request-skeleton-loader", {});

    data.hasContent = data.requestData && data.requestData.length > 0;

    // Get the empty state image
    data.mespEmptyStateImage = sn_ex_sp.RequestConstants.IMAGES.MESP_EMPTY_STATE;

    data.emptyStateMessages = {
        default: gs.getMessage("No requests found"), // Default message for all tabs
        noMatching: gs.getMessage("No matching results"), // When search/filter is used but no results found
    };

    data.emptyStateTitle = data.emptyStateMessages.default;

    const searchTerm = data.searchParam || "";
    const uiFilters = options.uiFilters || {};

    data.hasActiveFilters =
        searchTerm.trim() !== "" || Object.keys(uiFilters).length > 0;

    data.clearButtonText = searchTerm.trim() !== "" ? data.clearSearchText : data.clearFilterText;

    data.emptyStateTitle = data.hasActiveFilters ?
        data.emptyStateMessages.noMatching :
        data.emptyStateMessages.default;

    if (!input) {
        if (data.isDraftTab) {
            data.requestResults = requestUtil.getDraftItems(data.offset, data.limit, data.searchParam);
            data.requestData = data.requestResults.draftItems;
            data.requestCards = getDraftCardsData(data.requestData);
            data.showMore = data.requestResults.showMore;
            if (data.showMore) {
                data.offset += data.limit;
            }
            data.isUiFiltersEmpty = true;
        } else {
            data.requestResults = requestUtil.getRequests(data.tabId, data.uiFilters, data.searchParam, data.limit);
            data.requestData = data.requestResults.data;
            data.showMore = data.requestResults.showMore;
            data.requestCards = getRequestCardsData(data.requestData);
            data.lastRenderedCard = data.requestResults.lastRenderedCard;
            data.hasContent = data.requestData && data.requestData.length > 0;
            data.isUiFiltersEmpty = Object.keys(data.uiFilters).length === 0 && data.uiFilters.constructor === Object;
        }
    }

    function getRequestCardsData(dataResults) {
        var dataPayload = [];
        dataResults.forEach(function(item) {
            var itemPayload = {};
            var widgetName = 'mesp-request-card';
            itemPayload.title = item.title;
            itemPayload.description = item.descriptionValues;
            itemPayload.url = item.urlParams;
            itemPayload.tableName = item.tableName;
            itemPayload.screenId = item.screenId;
            itemPayload.timestamp = item.timestamp;
            itemPayload.status = item.status;
            itemPayload.sysID = item.sysID;
            itemPayload.widgetData = $sp.getWidget(widgetName, itemPayload);
            dataPayload.push(itemPayload.widgetData);
        });
        return dataPayload;
    }

    function getDraftCardsData(dataResults) {
        var dataPayload = [];
        dataResults.forEach(function(item) {
            var itemPayload = {};
            var widgetName = 'mesp-request-card';
            itemPayload.title = item.cartItemName;
            itemPayload.description = [item.itemName];
            itemPayload.url = item.urlParams;
            itemPayload.tableName = item.tableName;
            itemPayload.screenId = item.screenId;
            itemPayload.timestamp = item.timestamp;
            itemPayload.sysID = item.sysID;
            itemPayload.status = gs.getMessage("Draft");
            itemPayload.actionConfig = {
                label: gs.getMessage("Delete"),
                eventName: data.draftDeleteEventName,
                eventPayload: item.sysID,
            };
            itemPayload.widgetData = $sp.getWidget(widgetName, itemPayload);
            dataPayload.push(itemPayload.widgetData);
        });
        return dataPayload;
    }

})();
