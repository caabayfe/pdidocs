(function() {

    var pageId = $sp.getParameter('id') || '';
    var userId = $sp.getParameter('sys_id') || gs.getUserID();
    options = input && input.options ? input.options : options;
    var widgetMappingId = options && options.tabWidgetMappingId ? options.tabWidgetMappingId : '';
    var epUtils = new sn_employee.ep_Utils();

    if (input && input.action === "SAVE_PREFERENCE") {
        epUtils.saveWidgetVisibilityPreference(widgetMappingId, input.visibility);
    }

    var isUserSelectionEnabled = getUserSelectionEnablement();

    var isLoggedInUsersProfile = epUtils.isLoggedInUsersProfile(userId);
    var isWidgetVisibleOnPage = epUtils.isPublicProfileVisibilityWidgetVisibleOnPage(pageId);
    isUserSelectionEnabled = (isUserSelectionEnabled === '') ? epUtils.isUserSelectionEnabled(widgetMappingId) : isUserSelectionEnabled;
    var showAccessibilityMsg = isUserSelectionEnabled && isLoggedInUsersProfile && isWidgetVisibleOnPage;

    data.msg = gs.getMessage("This section is visible to");
    data.accessibilityMsg = showAccessibilityMsg ? epUtils.getAccessibilityMsg(widgetMappingId, userId) : "";
    data.isMobile = gs.isMobile();
    data.visibilityOptions = epUtils.getVisibilityOptions();
    data.widgetVisibility = epUtils.getWidgetVisibilityOnTabs(widgetMappingId, userId);
    data.widgetTitle = options.widgetTitle;
    data.widgetMappingId = widgetMappingId;
    data.options = options;

    function getUserSelectionEnablement() {
        var isUserSelectionEnabled = '';
        if (options && options.isUserSelectionEnabled !== undefined) {
            isUserSelectionEnabled = options.isUserSelectionEnabled;
            if (isUserSelectionEnabled === 'true' || isUserSelectionEnabled === true)
                return true;
            return false;
        }
        return '';
    }

})();
