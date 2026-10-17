(function executeRule(current, previous) {

    if (current.source_table_name.toString() === previous.source_table_name.toString())
        return;

    var gr = new GlideRecord(current.sys_class_name);
    gr.addQuery('source_table_name', current.source_table_name);
    gr.query();
    if (gr.hasNext()) {
        var msg = gs.getMessage("A {0} record with the selected table value already exists. Please update the existing record. Duplicate records cannot exist for a single table.", current.sys_class_name);
        gs.addErrorMessage(msg);
        current.setAbortAction(true);
    }
})(current, previous);
