(function executeRule(current, previous /*null when async*/ ) {
    if (current.isActionAborted()) {
        return;
    }
    
    var alertLinkRedirect = gs.getProperty("evt_mgmt.alert_link_redirect", "/em_alert.do?sys_id=");
    

    var alertManager = new SNC.AlertManager();
    alertManager.addStep("Alert BR: Add work note on alert Close/Reopen");


    //Don't write worknotes when it's configured not to be written
    var updatePrimary = false;
    var updateSecondary = false;
    var shouldShowWorkNotesProp = gs.getProperty("evt_mgmt.alert_groups_reasoning.enable_worknotes", "all");
    if (shouldShowWorkNotesProp == "all") {
        updatePrimary = true;
        updateSecondary = true;
    } else if (shouldShowWorkNotesProp == "secondary") {
        updateSecondary = true;
    } else if (shouldShowWorkNotesProp == "primary") {
        updatePrimary = true;
    }

    if (current.correlation_group == 2) {


        var parent = current.parent.getRefRecord();
        var groupLink = "[code]" + "<u>" + "<a href=\"" + alertLinkRedirect + current.parent + "\">" + current.parent.number + "</u>" + "</a>" + "[/code]";
        var alertLink = "[code]" + "<u>" + "<a href=\"" + alertLinkRedirect + current.sys_id + "\">" + current.number + "</u>" + "</a>" + "[/code]";
        if (current.state == "Closed") {
            if (updateSecondary) {
                alertManager.updateWorkNotesOnAlert(current, gs.getMessage("The alert closed and therefore it was removed from group {0}", [groupLink]));
            }

            if (updatePrimary) {
                alertManager.updateWorkNotesOnAlert(parent, gs.getMessage("Alert {0} was closed and therefore it was removed from group", [alertLink]));
            }
        } else if (current.state == "Reopen") {
            if (updateSecondary) {
                alertManager.updateWorkNotesOnAlert(current, gs.getMessage("The alert reopened and therefore it was added to group {0}", [groupLink]));
            }

            if (updatePrimary) {
                alertManager.updateWorkNotesOnAlert(parent, gs.getMessage("Alert {0} was reopened and therefore it was added to group", [alertLink]));
            }
        }
        if (updatePrimary && parent.isValid() && parent.isValidRecord()) {
            parent.update();
        }

    } else if (current.correlation_group == 1) {
        if (updatePrimary) {
            if (current.state == "Closed") {
                alertManager.updateWorkNotesOnAlert(current, gs.getMessage("Alert group was closed"));
            } else if (current.state == "Reopen") {
                alertManager.updateWorkNotesOnAlert(current, gs.getMessage("Alert group was reopened"));
            }
        }
    }
})(current, previous);
