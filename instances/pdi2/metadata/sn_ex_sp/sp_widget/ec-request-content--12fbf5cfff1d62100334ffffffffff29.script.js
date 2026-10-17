(function() {
    data.draftDeleteEventName = "ec_requests.deleteDraft";

    data.uiFilters = options.uiFilters || {};
    data.tabId = options.tabId;
    data.searchParam = options.searchParam;
    data.limit = parseInt(options.limit);
    var portalId = $sp.getDisplayValue("sys_id");
    var requestUtil = new sn_ex_sp.RequestUtil(portalId);
    data.isDraftTab = data.tabId == options.draftTabId;
    data.offset = 0;
    data.showMoreButtonText = gs.getMessage("Show more requests");

    if (input && input.action == 'deleteDraft') {
        data.draftItemId = input.draftItemId;
        requestUtil.deleteDraftItem(data.draftItemId);
    }

    if (input && input.action == 'loadMoreRequests') {
        if (!input.isDraftTab) {
            data.nextRequests = requestUtil.getRequests(input.tabId, input.uiFilters, input.searchParam, input.limit, input.lastRenderedCard);
            data.nextRequestData = data.nextRequests.data;
            data.nextRequestCards = getRequestCardsData(data.nextRequestData);
            data.showMore = data.nextRequests.showMore;
            data.lastRenderedCard = data.nextRequests.lastRenderedCard;
        } else {
            data.nextRequests = requestUtil.getDraftItems(input.offset, input.limit, data.searchParam);
            data.nextRequestData = data.nextRequests.draftItems;
            data.nextRequestCards = getDraftCardsData(data.nextRequestData);
            data.showMore = data.nextRequests.showMore;
            data.lastRenderedCard = "";
        }
    }

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

    data.hasContent = data.requestData && data.requestData.length > 0;

    data.emptyTitle = data.isDraftTab ? "" : gs.getMessage("No requests found.");
    data.emptyDescription = data.isDraftTab ? gs.getMessage("You haven't saved any drafts yet.") : gs.getMessage("Looks like you haven’t submitted any requests yet. Raise a new request to get started.");
    data.emptyIcon = "fa-file-text";

    if (!data.hasContent && !data.isUiFiltersEmpty) {
        data.emptyTitle = gs.getMessage("No results match your criteria.");
        data.emptyDescription = gs.getMessage("Try removing some filters");
        data.emptyIcon = "fa-times-circle-o";
    }

    function getRequestCardsData(dataResults) {
        var dataPayload = [];
        dataResults.forEach(function(item) {
            var itemPayload = {};
            var widgetName = 'ec-request-card';
            itemPayload.title = item.title;
            itemPayload.description = item.descriptionValues;
            itemPayload.url = item.urlParams;
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
            var widgetName = 'ec-request-card';
            itemPayload.title = item.cartItemName;
            itemPayload.description = [item.itemName];
            itemPayload.url = item.urlParams;
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
