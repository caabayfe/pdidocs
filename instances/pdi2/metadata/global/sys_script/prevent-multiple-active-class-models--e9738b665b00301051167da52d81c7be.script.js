(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('cmdb_dynamic_ire_model');
    gr.addActiveQuery();
    gr.addQuery("cmdb_class", current.cmdb_class);
    gr.addQuery("sys_id", "!=", current.sys_id);
    gr.query();

    if (gr.getRowCount() > 0) {
        gs.addErrorMessage(gs.getMessage("Cannot have more than one active model for class: {0}", current.cmdb_class));
        current.setAbortAction(true);
    }
})(current, previous);
