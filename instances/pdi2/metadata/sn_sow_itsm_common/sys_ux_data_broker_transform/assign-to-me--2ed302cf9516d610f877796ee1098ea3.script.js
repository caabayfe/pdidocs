function transform(input) {

    if (!input.table || !input.recordSysId) {
        gs.error("Invalid or missing input parameters");
        return;
    }
    var record = new GlideRecord(input.table);
    if (!record.get(input.recordSysId)) {
        gs.error("Record not found: " + input.table + ", sysId: " + input.recordSysId);
        return;
    }

    if (!record.active || !record.assigned_to.canWrite()) {
        var permissionError = gs.getMessage('You do not have permission to update assigned to');
        return {
            success: false,
            message: permissionError
        };
    } else if (!record.assignment_group.nil() && !gs.getUser().isMemberOf(record.assignment_group.toString())) {
        var groupError = gs.getMessage(
            "Assigned to user - {0} must be a member of Assignment group - {1}",
            [gs.getUserDisplayName(), record.assignment_group.getDisplayValue()]
        );
        return {
            success: false,
            message: groupError
        };

    } else if (record.assignment_group.nil()) {

        var commonUtils = new sn_sow_itsm_common.SOWITSMCommonUtils();
        var memberGroups = commonUtils.getMemberGroups(gs.getUserID());
        if (memberGroups.length > 1) {
            var multipleGroupsError = gs.getMessage(
                "Assigned to user - {0} is a member of multiple groups, please select one as Assignment group",
                [gs.getUserDisplayName()]
            );
            return {
                success: false,
                message: multipleGroupsError
            };
        } else if (memberGroups.length == 1)
            record.assignment_group = memberGroups[0];
    }
    record.assigned_to = gs.getUserID();
    record.update();
    var successMsg = gs.getMessage("Record updated successfully with assigned to user - {0}", [gs.getUserDisplayName()]);
    return {
        success: true,
        message: successMsg
    };
}
