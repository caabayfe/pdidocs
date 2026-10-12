(function executeRule(current, previous /*null when async*/ ) {
    //Return early if current is not being set to active
    if (!current.active) {
        return;
    }
    //Run query to check for active pipeline of same source environment and type
    var gr = new GlideRecord('sn_pipeline_pipeline');
    gr.addQuery("sys_id", "!=", current.sys_id);
    gr.addQuery("source_environment", current.source_environment);
    gr.addQuery("pipeline_type", current.pipeline_type);
    gr.addQuery("active", true);
    gr.query();

    //Return early if there are no active pipelines with the same source environment and type
    if (!gr.next()) {
        return;
    }

    gs.addErrorMessage(gs.getMessage('The {0} is already configured as a source environment in {1}. An environment can only be configured as the source environment in one pipeline',
        [GlideStringUtil.escapeHTML(gr.source_environment.name), GlideStringUtil.escapeHTML(gr.name)]));
    current.setAbortAction(true);

})(current, previous);
