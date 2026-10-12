(function executeRule(current, previous /*null when async*/ ) {

    var priorityGr = new GlideRecord('ds_permission_priority');
    priorityGr.addQuery('provider_name', current.provider_name);
    priorityGr.addQuery('priority', current.priority);
    priorityGr.addQuery('sys_id', '!=', current.sys_id);
    priorityGr.query();

    while (priorityGr.next()) {
        if (priorityGr.name != current.name) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('A record with the same Priority already exists for this Provider Name.'));
            return;
        }
    }

})(current, previous);
