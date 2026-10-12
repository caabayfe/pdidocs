(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('guided_setup_configuration');
    gr.addQuery('parent_guided_setup', current.parent_guided_setup);
    gr.query();
    if (gr.next() && gr.sys_id != current.sys_id) {
        gs.addErrorMessage(gs.getMessage("Configuration for the guided setup already exists"));
        current.setAbortAction(true);
    }

})(current, previous);
