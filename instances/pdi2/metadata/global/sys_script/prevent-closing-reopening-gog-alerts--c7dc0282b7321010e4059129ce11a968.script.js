(function executeRule(current, previous /*null when async*/ ) {

    var additionalInfo = JSON.parse(current.additional_info);
    var allowSettingState = additionalInfo.sn_allow_setting_state;
    if (!allowSettingState) allowSettingState = "1"; // default to "Any" for backward compatibility

    if (current.state == "Closed") {
        // closing directly in not allowed if allowSettingState is "None"
        if (allowSettingState == "3") {
            // might have been closed automatically by parent, in which case the parent would also be closed.
            var parentState = getParentState(current);
            if (parentState != "Closed") {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage("You cannot close this alert directly."));
                return;
            }
        }
    } else if (previous.state == "Closed") {
        switch (allowSettingState) {
            case "1":
                // reopening is allowed directly if allowSettingState is "Any" (1).
                return;
            case "2":
                // automatic reopening is possible if a child was reopened
                if (!hasOpenChild(current)) {
                    current.setAbortAction(true);
                    gs.addErrorMessage(gs.getMessage("You cannot reopen this alert directly."));
                    return;
                }
                break;
			case "3":
				// automatic reopening is possible if parent was reopened
				if (current.parent.state == "Closed") {
					current.setAbortAction(true);
                    gs.addErrorMessage(gs.getMessage("You cannot reopen this alert directly."));
                    return;
				}
        }
    }

    function getParentState(alert) {
		return alert.parent.state;
    }

    function hasOpenChild(alert) {
        var openChildren = new GlideRecord("em_alert");
        openChildren.addQuery("parent", alert.sys_id);
        openChildren.addQuery("state", "!=", "Closed");
		openChildren.setLimit(1);
		openChildren.query();
        var count = openChildren.getRowCount();
        return count > 0;
    }

})(current, previous);
