(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('analytics_category_m2m');

    if (current.operation() == 'insert') {
        gr.addQuery('category', current.category);
        gr.addQuery('type', current.type);
        gr.addQuery('artifact_id', current.artifact_id);
        gr.query();
        if (gr.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Duplicate dashboard category assignment"));
            current.setAbortAction(true);
        }
    }
    if (current.operation() == 'update') {
        gr.addQuery('category', current.category);
        gr.addQuery('type', current.type);
        gr.addQuery('artifact_id', current.artifact_id);
        gr.addQuery('sys_id', '!=', current.sys_id);
        gr.query();
        if (gr.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Duplicate dashboard category assignment"));
            current.setAbortAction(true);
        }
    }

})(current, previous);
