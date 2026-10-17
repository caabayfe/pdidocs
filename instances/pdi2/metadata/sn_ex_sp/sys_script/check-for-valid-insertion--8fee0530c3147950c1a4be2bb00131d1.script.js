(function executeRule(current, previous /*null when async*/ ) {
    if (!current.portal_extensible_navigation.portal) {
        return;
    }
    var errorMessage = "";

    if (current.isNewRecord()) {
        var portalNavUtil = new sn_ex_sp.PortalExtensibleNavigationUtil();

        if (current.navigation_item_type == 'topic') {
            if (!gs.nil(current.parent_item) && portalNavUtil.getTopicCountInHierarchy(current) > 2) {
                current.setAbortAction(true);
                errorMessage = gs.getMessage("Topics more than three levels deep cannot be added as menu items.");
            } else {
                // getTopics function returns encoded query string staring width 'sys_idIN', slice is used to remove 'sys_idIN' before split.
                var validTopicsFormLookUp = portalNavUtil.getTopics(current.portal_extensible_navigation).slice(8).split(',');
                if (validTopicsFormLookUp.indexOf(current.topic.toString()) === -1) {
                    current.setAbortAction(true);
                    errorMessage = gs.getMessage("Invalid entry. Please check the topic hierarchy for {0} ", current.getDisplayValue());
                }
            }
        } else {
            // getTopics function returns encoded query string staring width 'sys_idIN', slice is used to remove 'sys_idIN' before split.
            var validMenuFormLookUp = portalNavUtil.getMenus(current.portal_extensible_navigation).slice(8).split(',');
            if (validMenuFormLookUp.indexOf(current.menu.toString()) === -1) {
                current.setAbortAction(true);
                errorMessage = gs.getMessage("Invalid entry. Please check the menu hierarchy for {0} ", current.getDisplayValue());
            }
        }
    }
    if (!gs.nil(errorMessage)) {
        current.setAbortAction(true);
        gs.addErrorMessage(errorMessage);
    }
})(current, previous);
