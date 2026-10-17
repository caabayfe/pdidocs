function($scope, spAriaUtil, i18n, spModal) {

    var c = this;

    c.translateDeleteDraftMsg = function(draftItemName) {
        return i18n.getMessage('Delete {0}').withValues([draftItemName]);
    }

    c.sendResultsLiveMessage = function(count) {
		if (count === 0 && !c.filterText) {
			spAriaUtil.sendLiveMessage(c.data.messages.noResultsFound);
		} else if (count === 0 && c.filterText) {
			spAriaUtil.sendLiveMessage(c.data.messages.noSearchResultsFound);
		} else {
			var resultMsg = (count === 1) ? "{0} result returned" : "{0} results returned";
			i18n.getMessage(resultMsg , function(translatedMessage) {
				spAriaUtil.sendLiveMessage(translatedMessage.withValues([count]));
			});
		}
    }

    c.trackPage = function() {
        window.GlideWebAnalytics.trackEvent("Service Catalog", "Catalog My Requests", "My Requests Widget Loaded");
    }

    if (c.data.is_new_order)
        spAriaUtil.sendLiveMessage(c.data.requestSubmitMsg);

    c.viewFilter = 'open';
    c.filterOptions = [{key:'open',value:c.data.messages.openRequests},{key:'close',value:c.data.messages.closedRequests}];
    c.tabs = [{id : 'requests', template : 'myRequestsTemplate', heading : c.data.messages.requestsTabLabel, active: c.data.isRequestsTabActive}, {id : 'drafts', template : 'draftItemsTemplate', heading : c.data.messages.draftsTabLabel, active: c.data.isDraftsTabActive}];

    c.changeView = function() {
        window.GlideWebAnalytics.trackEvent("Service Catalog", "Catalog My Requests", "Open/Close Filter Toggled");
        c.server.get({
            action: "change_view",
            view: c.viewFilter,
            search_text: c.filterText
        }).then(function(response) {
            c.data = response.data;
            c.sendResultsLiveMessage(c.data.request.req_list.length);
        });
    }

    c.search = function() {
        c.server.get({
            action: 'search',
            search_text: c.filterText,
            view: c.viewFilter
        }).then(function(response) {
            c.data = response.data;
            c.sendResultsLiveMessage(c.data.request.req_list.length);
        });
    }

    c.checkEnter = function(event) {
        if (event.which === 13)
            c.search();
    }


    c.filterDraftItem = function(item) {
        if (!c.data.draftSearchText)
            return true; // If no searchText, return true to show all items

        var searchText = c.data.draftSearchText.toLowerCase();

        // Perform the filtering based on item.name or item.displayName
        return (
            (item.name && item.name.toLowerCase().includes(searchText)) ||
            (item.cart_item_name && item.cart_item_name.toLowerCase().includes(searchText))
        );
    };

    c.updateFilteredDraftItems = function() {
        if (!c.data.draftItems)
            return;

        if (!c.data.draftSearchText)
            c.filteredDraftItems = c.data.draftItems;
        else {
            c.filteredDraftItems = c.data.draftItems.filter(function(item) {
                return c.filterDraftItem(item)
            });
        }
        if (c.data.isDraftsTabActive)
            c.sendResultsLiveMessage(c.filteredDraftItems.length);
    }

    c.filteredDraftItems = [];
    c.updateFilteredDraftItems();

    c.removeDraftItem = function(cartItem) {
        var options = {
            title: c.data.deleteDraftItemMsg,
            headerStyle: {
                border: 'none',
                'padding-bottom': 0
            },
            footerStyle: {
                border: 'none',
                'padding-top': 0
            },
            messageOnly: true,
            buttons: [{
                label: c.data.dialogCancel,
                primary: false
            }, {
                label: c.data.dialogDelete,
                'class': 'btn-danger',
                primary: true
            }],
        };

        spModal.open(options).then(function(actionButton) {
            if (actionButton) {
                if (!actionButton.primary)
                    return;

                c.fetchingDrafts = true;
                c.server.get({
                    action: "remove_item",
                    removeItemID: cartItem.sys_id,
                    prevLimit : c.data.draftItems && c.data.draftItems.length ? c.data.draftItems.length : 100,
                    attachmentTable: cartItem.attachment_table
                }).then(function(response) {
                    c.data.draftItems = response.data.draftItems;
                    c.data.hasMoreDrafts = response.data.hasMoreDrafts;
                    c.updateFilteredDraftItems();
                    c.fetchingDrafts = false;
                });
            }
        });
    }

    c.loadMore = function() {
        window.GlideWebAnalytics.trackEvent("Service Catalog", "Catalog My Requests", "Show More Clicked");
        var currentRequests = c.data.request.req_list.length;
        spAriaUtil.sendLiveMessage("${Loading more requests}");
        c.fetching = true;
        c.server.get({
            action: 'fetch_more',
            lastLimit: c.data.lastLimit,
            view: c.viewFilter,
            search_text: c.filterText
        }).then(function(response) {
            var addedRequests = response.data.request.req_list.length - currentRequests;
			var resultMsg = (addedRequests == 1) ? "{0} request added" : "{0} requests added";
			i18n.getMessage(resultMsg, function(message) {
			    spAriaUtil.sendLiveMessage(message.withValues([addedRequests]));
			});
            c.data = response.data;
            c.fetching = false;
        });
    }

    c.loadMoreDrafts = function() {
        c.fetchingDrafts = true;

        c.server.get({
            action: 'fetch_more_draft_items',
            prevLimit: c.data.draftItems && c.data.draftItems.length ? c.data.draftItems.length : 100,
        }).then(function(response) {
            c.data.draftItems = response.data.draftItems;
            c.data.hasMoreDrafts = response.data.hasMoreDrafts;
            c.updateFilteredDraftItems();
            c.fetchingDrafts = false;
        });
    }

    c.changeSelectedTab = function(selectedTab) {
        c.data.isRequestsTabActive = selectedTab == "requests";
        c.data.isDraftsTabActive = selectedTab == "drafts";
    }
}
