(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sys_db_object');
    gr.addQuery('name', current.source_table);
    var grOR = gr.addQuery('provider_class', 'com.glide.mif.core.vtable.MIFVTable');
    grOR.addOrCondition('provider_class', 'com.glide.mif.core.vtable.MIFVTableReadOnly');
    gr.setLimit(1);
    gr.query();

    if (gr.next()) {
        var errorMsg = gs.getMessage('Source table can not be a vtable.');
        gs.addErrorMessage(errorMsg);
        gs.error(errorMsg);
        current.setAbortAction(true);
    }

})(current, previous);
