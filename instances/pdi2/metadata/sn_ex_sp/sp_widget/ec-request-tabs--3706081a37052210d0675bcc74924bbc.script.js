(function() {
    var portalId = $sp.getDisplayValue("sys_id");
    var requestUtil = new sn_ex_sp.RequestUtil(portalId);

    data.limit = options.limit;

    data.draftTab = {
        label: gs.getMessage("Drafts"),
        selected: false,
        sys_id: "-1"
    };

    var portalSuffix = $sp.getPortalRecord().getValue("url_suffix");
    var disableDraft = gs.getProperty('glide.sc.disable.save_as_draft') === 'true';
    var enableDraftPortal = gs.getProperty('glide.sc.enable.save_as_draft.portal.' + portalSuffix) === 'true';
    data.showDraftsTab = !(disableDraft || !enableDraftPortal);

    data.draftSearchText = $sp.getParameter("draftSearchText");
    data.activeTabId = $sp.getParameter("tab_id");
    data.draftSearchText = gs.nil(data.draftSearchText) ? "" : decodeURIComponent(data.draftSearchText);
    data.selectedTab = {};

    if (!input) {
        data.viewData = requestUtil.getViewFilter();
        data.tabs = !gs.nil(data.viewData) && Object.keys(data.viewData).length > 0 ? data.viewData.options : [];
        if (data.showDraftsTab) {
            data.tabs.push(data.draftTab);
        }
        // Ensure we have data on initial load by setting the selected tab
        data.activeTabId = data.activeTabId || (data.tabs.length > 0 ? data.tabs[0].sys_id : null) ;
        if (data.activeTabId) {
            setSelectedTab(data.activeTabId, undefined, "", options.limit);
        }
    }

    function setSelectedTab(tabId, uiFilters, searchParam, limit) {
        var isDraftTab = (tabId === data.draftTab.sys_id);
        data.selectedTab = {
            tabId: tabId,
            draftTabId: data.draftTab.sys_id,
            uiFilters: uiFilters,
            searchParam: isDraftTab ? (searchParam || data.draftSearchText) : searchParam,
            limit: limit
        };
        options.filterData = requestUtil.getRequestFiltersForTab(tabId);
        options.searchText = encodeURIComponent(data.selectedTab.searchParam) || "";
        options.hasFilters = options.filterData.length > 0;
        data.requestFilters = $sp.getWidget('ec-request-filters', options);

        if (!options.hasFilters || !gs.nil(uiFilters)) {
            data.requestContent = $sp.getWidget('ec-request-content', data.selectedTab);
        }
    }

    if (input && input.action === 'fetchTabData') {
        setSelectedTab(input.tabId, input.uiFilters, input.searchParam, input.limit);
    }

    if (input && input.action === 'fetchSwitchedTabData') {
        setSelectedTab(input.tabId, undefined, input.searchParam, input.limit);
    }
})();
