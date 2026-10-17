(function executeRule(current, previous) {
    var vaSysId = gs.getProperty('com.glide.cs.va.sys_user');
    if (current.isActionAborted() || current.opened_at.nil() || (current.agent_chat && current.assigned_to == vaSysId)) {
        return;
    }

    if (current.isValidField('live_handoff_time') && current.agent_chat) {
        if (current.wait_time == '1970-01-01 00:00:00' || current.wait_time.nil())
            current.wait_time.setDisplayValue(gs.dateDiff(current.getValue("live_handoff_time"), new GlideDateTime(), false));
    } else {
        if (current.state == 'work_in_progress' && current.wait_time.nil()) {
            current.wait_time.setDisplayValue(gs.dateDiff(current.getValue("opened_at"), new GlideDateTime(), false));
        } else if (!current.wait_time.nil() && current.opened_at.changes()) {
            var inProgressAt = previous.opened_at.dateNumericValue() + current.wait_time.dateNumericValue();
            var openedAt = current.opened_at.dateNumericValue();
            var newWaitTime = inProgressAt < openedAt ? 0 : inProgressAt - openedAt;
            current.wait_time.setDateNumericValue(newWaitTime);
        }
    }
})(current, previous);
