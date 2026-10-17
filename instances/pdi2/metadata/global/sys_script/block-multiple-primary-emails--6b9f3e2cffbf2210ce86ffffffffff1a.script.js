(function executeRule(current, previous /*null when async*/ ) {
    if (current.active && current.primary_email) {
        var gr = new GlideAggregate('cmn_notif_device');
        gr.addQuery('user', current.user);
        gr.addQuery('type', 'email');
        gr.addQuery('primary_email', true);
        gr.addQuery('active', true);
        gr.addQuery('sys_id', '!=', current.sys_id); // exclude current
        gr.addAggregate('COUNT');
        gr.query();

        if (gr.next() && gr.getAggregate('COUNT') > 0) {
            gs.addErrorMessage(gs.getMessage("A primary email already exists for this user."));
	          current.setAbortAction(true);
        }
    }
})(current, previous);
