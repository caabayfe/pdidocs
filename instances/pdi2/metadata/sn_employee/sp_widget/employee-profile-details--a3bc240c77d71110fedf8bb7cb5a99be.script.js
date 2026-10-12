(function() {
    var util = new sn_employee.ep_Utils();
    data.isMobile = gs.isMobile();
    data.moreMsg = sn_i18n.Message.getMessage("sn_employee", "More");
    var profileUserId = $sp.getParameter("sys_id") || gs.getUserID();
    data.tabIdFromUrl = $sp.getParameter("tab_id");
    data.widgetIdFromUrl = $sp.getParameter("widget_id");
    var visitorUserId = gs.getUserID();
    if (input && input.tabId) {
        var tabId = '';
        tabId = input.tabId;
        var widgets = util.getWidgets(tabId, profileUserId, visitorUserId);
        for (var i = 0; i < widgets.length; i++) {
            widgets[i].widgetData = $sp.getWidget(widgets[i].widgetId, widgets[i].options);
            widgets[i].selected = data.widgetIdFromUrl == widgets[i].widgetId ? true : false;
        }
        data.widgets = widgets;
        return;
    }
    var portal = $sp.getPortalRecord().getUniqueValue();
    var portalConfigGR = util.getPortalConfiguration(portal);
    data.tabs = util.getAccessibleProfileTabs(profileUserId, visitorUserId, portal);
    if (data.tabIdFromUrl && data.tabs.length) {
        var isValidTabId = false;
        data.tabs.forEach(function(tab, index) {
            if (tab.tabId == data.tabIdFromUrl) {
                tab.selected = true;
                isValidTabId = true;
            } else
                tab.selected = false;
        });
        if (!isValidTabId)
            data.tabs[0].selected = true;
    }
    data.tabLimit = options.tabs_count;
    data.showSideScrollBar = portalConfigGR ? portalConfigGR.getValue('side_bar')=="1" : true;

})();
