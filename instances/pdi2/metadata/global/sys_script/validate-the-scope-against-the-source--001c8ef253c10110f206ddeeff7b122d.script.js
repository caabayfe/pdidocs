(function executeRule(current, previous /*null when async*/ ) {

    var source_scope = '';
    var gr = new GlideRecord('pa_dm_analytics_source');
    gr.addQuery('sys_id', current.analytics_source);
    gr.query();
    if (gr.next()) {
        source_scope = gr.getValue('sys_scope');
    }
    if (source_scope != current.sys_scope) {
        var message = gs.getMessage("Indicator can be created or updated only in the same scope as its data snapshot source.");
        current.setAbortAction(true);
        gs.addErrorMessage(message);

        var isFormPage = GlideTransaction.get().getRequestParameter('isFormPage');
        if (!isFormPage) {
            gs.flushMessages();
        }
    }

})(current, previous);
