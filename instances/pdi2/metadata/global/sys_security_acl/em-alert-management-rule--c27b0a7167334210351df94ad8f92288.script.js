var answer = getAnswer();
answer;

function getAnswer() {

    if (!gs.getUser().hasRole("sn_sow_alert_rules.automation_read_nonglobal"))
        return false;

    if (gs.nil(current.assignment_group))
        return false;

    //current.assignment_group is string not reference, need to get the reference
    var gr = new GlideRecord("sys_user_group");

    if (gr.get("name", current.assignment_group)) {
        var manager = gr.getValue("manager");

        if (gs.getUser().getMyGroups().indexOf(gr.getUniqueValue()) !== -1)
            return true;

        if (!gs.nil(manager))
            if (manager === gs.getUserID())
                return true;
    }
    return false;
}
