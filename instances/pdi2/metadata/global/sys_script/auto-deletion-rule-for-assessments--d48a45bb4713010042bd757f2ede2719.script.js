var abort = false;

var gr = new GlideRecord('asmt_metric_result');
gr.addQuery('source_id', current.sys_id);
gr.addQuery('source_table', current.getTableName());
gr.setLimit(1);
gr.query();
if (gr.next()) {
    abort = true;
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage('Items with related metric results cannot be deleted'));
}

var gr = new GlideRecord('asmt_category_result');
gr.addQuery('source_id', current.sys_id);
gr.addQuery('source_table', current.getTableName());
gr.setLimit(1);
gr.query();
if (gr.next()) {
    abort = true;
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage('Items with related category results cannot be deleted'));
}

if (!abort) {
    var gr = new GlideRecord('asmt_assessable_record');
    gr.addQuery('source_id', current.sys_id);
    gr.addQuery('source_table', current.getTableName());
    gr.deleteMultiple();
}
