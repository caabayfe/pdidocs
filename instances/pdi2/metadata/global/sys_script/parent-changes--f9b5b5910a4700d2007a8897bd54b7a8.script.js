if (GlideProperties.getBoolean('glide.ui.schedule_job_for_group_parent_change', false) == false) {
    updateRolesForGrpMembers();
} else {
    updateRolesForGrpMembersByJob();
}

function updateRolesForGrpMembersByJob() {
    if (current.parent) {
        gs.addInfoMessage(gs.getMessage("New parent") + ": " + current.parent.name + " " + gs.getMessage("was") + ": " + previous.parent.name);
    }
    SNC.GroupParentUpdateJobScheduler.scheduleJob(current.sys_id, previous.parent, current.parent);
}

function updateRolesForGrpMembers() {
    gs.include("RoleManager");
    var rm = new RoleManager();
    if (current.parent) {
        gs.addInfoMessage(gs.getMessage("New parent") + ": " + current.parent.name + " " + gs.getMessage("was") + ": " + previous.parent.name);
        if (previous.parent) {
            rm.removeGroupRolesFromChild(previous.parent, current.sys_id);
        }
        rm.addGroupRolesToChild(current.parent, current.sys_id);

    } else if (previous.parent) {
        rm.removeGroupRolesFromChild(previous.parent, current.sys_id);
    }
}
