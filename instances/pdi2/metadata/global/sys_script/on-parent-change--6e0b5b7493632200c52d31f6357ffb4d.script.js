(function updateAlertParentAssoc(current, previous /*null when async*/ ) {
    if (gs.getProperty('evt_mgmt.alert_correlation.single_alert_grouping_enabled', 'true') == 'false')
        return;

    var ignoreParentUpdate = gs.getSession().getClientData("EM-IgnoreParentUpdateBR");
    //no need to run the bs rule if the correlation_group had changed, since it must not be a user command in this case
    // also, if the "IgnoreParentUpdate" parameter is set to the current parent, then we can ignore this rule, since the parent was set by internal Java code
    if (current.correlation_group == previous.correlation_group && current.parent != ignoreParentUpdate) {

        var alertManager = new SNC.AlertManager();
        alertManager.addStep("Alert BR: On Parent Change (before)");

        // Codes from the java code
        var ADD_PRIMARIES_NOT_SUPPORT_RES = 1;
        var ADD_NO_PRIMARIES_RES = 3;

        // Do not allow to assign myself as a parent
        if (current.sys_id == current.parent) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("An alert cannot be a parent of itself"));
            return;
        }

        if (isValidReference(previous.parent)) {
            // cannot change the parent if the parent is log analytics
            if (parentIsLogAnalytics(previous)) {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage("This group type doesn't allow manual removal of alerts"));
                return;
            }
        }

        if (!isValidReference(current.parent)) { // Remove parent		
            if (isValidReference(previous.parent)) {
                alertManager.removeAlertsIdsFromAlertGroup(previous.parent, current.sys_id, false);
            }
        } else { // Add or change parent
            // Closed alert cannot have a parent
            if (current.state == "Closed") {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage("Cannot assign a parent to a closed alert"));
                return;
            }

            if (current.parent.state == "Closed") {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage("Cannot assign a closed alert as a parent"));
                return;
            }

            // cannot add alerts to a LogAnalytics group
            if (parentIsLogAnalytics(current)) {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage("This group type doesn't allow manual addition of alerts"));
                return;
            }

            var result = alertManager.addNotAccociatedAlertsToGroups(current.sys_id, current.parent);
            switch (result) {
                case ADD_PRIMARIES_NOT_SUPPORT_RES:
                    current.setAbortAction(true);
                    gs.addErrorMessage(gs.getMessage("The selected alert is already a parent and cannot become secondary to another alert."));
                    break;
                case ADD_NO_PRIMARIES_RES:
                    current.setAbortAction(true);
                    gs.addErrorMessage(gs.getMessage("Cannot assign a secondary alert as a parent"));
                    break;
            }
        }
    }

    function isValidReference(reference) {
        return GlideStringUtil.notNil(reference) && reference != "NULL";
    }

    function parentIsLogAnalytics(alert) {
        var groupSource = alert.parent.group_source;
        return groupSource == "9" || groupSource == "10";
    }

})(current, previous);
