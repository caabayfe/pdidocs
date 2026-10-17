(function executeRule(current, previous /*null when async*/ ) {
    // Query the table to check for existing records with the same provider and order
    var dsDocConfig = new GlideRecord(current.getTableName());
    dsDocConfig.addQuery('provider', current.provider);
    dsDocConfig.addQuery('order', current.order);
    dsDocConfig.addQuery('sys_id', '!=', current.sys_id);
    dsDocConfig.query();

    // If a record exists, abort the insertion
    if (dsDocConfig.next()) {
        gs.addErrorMessage(gs.getMessage('A Document Configuration record with the same Provider and Order already exists.'));
        current.setAbortAction(true);
    }
})(current, previous);
