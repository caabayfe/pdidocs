(function executeRule(current, previous /*null when async*/) {
    var isDuplicate = isDuplicateDelegation(current);
    if (isDuplicate) {
        gs.addErrorMessage(gs.getMessage("There is already an existing delegation for this user and delegate with the same delegated items within the same time period."));
        current.setAbortAction(true);
        return;
    }
})(current, previous);

function isDuplicateDelegation(current) {
    var delegations = new GlideRecord('sys_user_delegate');
    delegations.addQuery('user', current.user);
    delegations.addQuery('delegate', current.delegate);
    delegations.addQuery('starts', current.starts);
    delegations.addQuery('ends', current.ends);
    delegations.addQuery('approvals', current.approvals);
    delegations.addQuery('assignments', current.assignments);
    delegations.addQuery('invitations', current.invitations);
    delegations.addQuery('notifications', current.notifications);
    delegations.addQuery("sys_id", "!=", current.sys_id);
    delegations.query();
    return delegations.hasNext();
}
