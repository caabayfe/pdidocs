assignToMe();

function assignToMe() {
    if (!current.active || !current.assigned_to.canWrite()) {
        gs.addErrorMessage(gs.getMessage('{0}, You do not have permission to update assigned to', [current.number]));
        return;
    } else if (!current.assignment_group.nil() && !gs.getUser().isMemberOf(current.assignment_group.toString())) {
        gs.addErrorMessage(gs.getMessage("{0}, Assigned to user {1} must be member of Assignment group {2}", [current.number, gs.getUserDisplayName(), current.assignment_group.getDisplayValue()]));
        return;
    } else if (current.assignment_group.nil()) {
        var memberGroups = (new sn_sow_itsm_common.SOWITSMCommonUtils()).getMemberGroups(gs.getUserID(), 2);
        if (memberGroups.length > 1) {
            var gr = new GlideRecord("sys_user");
            if (GlidePluginManager.isActive("com.snc.wfo") && gr.get(gs.getUserID()) && gr.primary_group) {
                current.assignment_group = gr.primary_group;
            } else {
                gs.addErrorMessage(gs.getMessage("{0}, Assigned to user {1} is member of multiple groups, please select one as Assignment group or add a primary group to user {1}", [current.number, gs.getUserDisplayName()]));
                return;
            }
        }
        if (memberGroups.length == 1)
            current.assignment_group = memberGroups[0];
    }
    current.assigned_to = gs.getUserID();
    current.update();
}
