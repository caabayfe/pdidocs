// Set all of the pending user approvals for this group approval to not required

function isGroupApprovalCreatedByFlowDesigner(me) {
        // group approval record created by workflow
    if (me.wait_for == "workflow")
        return false;

        // check sys properties
    if (gs.getProperty("com.glide.hub.flow.approval.version", "V2") != "V2" ||
        gs.getProperty("com.glide.hub.flow.approval.function.early_terminate", "true") != "true" ||
        gs.getProperty("com.glide.hub.flow.approval.function.early_terminate.common_user", "true") != "true")
        return false;

    // group approval record created by AFA
    if (me.wait_for == "process_flow")
        return true;

    // group approval was created manually and picked up by AFA
    var grpRefGr = new GlideRecord('sys_flow_group_approval_listener_reference');
    grpRefGr.addQuery('approval', me.sys_id);
    grpRefGr.query();
    if (grpRefGr.next())
        return true;

    // TODO: handle the case of group approval was created manually when AFA is waiting

    return false;
}

if (!isGroupApprovalCreatedByFlowDesigner(current)) {
    var util = new WorkflowApprovalUtils();
    util.setPendingUserApprovalsByGroup(current.sys_id, 'not_required');
}
