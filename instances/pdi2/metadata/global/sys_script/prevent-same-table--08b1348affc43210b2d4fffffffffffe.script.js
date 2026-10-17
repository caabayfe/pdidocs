(function executeRule(current, previous /*null when async*/ ) {

    var dupGR = new GlideRecord('reconcile_duplicate_related_table_config');
    dupGR.addQuery('table', current.table);
    dupGR.addQuery('sys_id', '!=', current.sys_id);
    dupGR.setLimit(1);

    dupGR.query();

    if (dupGR.hasNext()) {
        gs.addErrorMessage(gs.getMessage('A record with the same Table already exists.'));
        current.setAbortAction(true);
    }

})(current, previous);
