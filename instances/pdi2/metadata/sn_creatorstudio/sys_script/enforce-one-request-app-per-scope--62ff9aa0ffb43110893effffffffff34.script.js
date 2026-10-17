(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sn_creatorstudio_request_app_config');
    gr.addQuery('sys_id', '!=', current.sys_id);
    gr.addQuery('sys_scope', current.sys_scope);
    gr.query();

    if (gr.next()) {
        var errMsg = gs.getMessage('A request app under this scope already exists! Please change your scope and try again.');
        current.setAbortAction(true);
        gs.addErrorMessage(errMsg);
    }
	
})(current, previous);
