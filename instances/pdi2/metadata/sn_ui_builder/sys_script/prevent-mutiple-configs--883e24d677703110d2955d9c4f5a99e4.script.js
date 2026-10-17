(function executeRule(current, previous /*null when async*/ ) {
    const propsConfigGA = new GlideAggregate(current.getTableName());
    propsConfigGA.addAggregate('COUNT');
    propsConfigGA.addQuery('active', true);
    propsConfigGA.addQuery('target_table', current.target_table);
    propsConfigGA.addQuery('target', current.target);
    if (current.operation() === 'update') {
        propsConfigGA.addQuery('sys_id', '!=', current.sys_id.toString());
    }
    propsConfigGA.query();
    if (propsConfigGA.next() && propsConfigGA.getAggregate('COUNT') != 0) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Only one prop config can be active for {0} at a time, please deactivate or remove any other prop configs related to {0}',current.target.getDisplayValue()));
    }

})(current, previous);
