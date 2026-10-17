(function executeRule(current, previous /*null when async*/ ) {
    var tablename = current.tablename;

    if (hasRule('sys_archive', 'table', tablename) ||
        hasRule('sys_auto_flush', 'tablename', tablename) ||
        hasRule('sys_unreferenced_record_rule', 'tablename', tablename)) {
        gs.addErrorMessage(gs.getMessage("This policy cannot be deleted. There are rules associate with this policy"));
        current.setAbortAction(true);
    }

})(current, previous);

function hasRule(targetTable, tableField, tablename) {
    var gr = new GlideRecord(targetTable);
    gr.addQuery(tableField, tablename);
    gr.query();

    return gr.hasNext();
}
