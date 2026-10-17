(function executeRule(current, previous /*null when async*/) {
	
    var restInsertMultiple = new GlideRecord('sys_rest_insert_multiple');
    restInsertMultiple.addQuery('source_table',  current.source_table);
    restInsertMultiple.addActiveQuery();
    restInsertMultiple.query();
    if (restInsertMultiple.next() && restInsertMultiple.sys_id != current.sys_id) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Source table {0} already has an active rest insert multiple {1}', [restInsertMultiple.source_table, restInsertMultiple.name]));
        return;
    }

})(current, previous);
