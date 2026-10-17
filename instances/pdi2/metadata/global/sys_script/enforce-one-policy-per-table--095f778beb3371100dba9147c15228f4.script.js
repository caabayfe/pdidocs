(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sys_dm_policy');
    gr.addQuery('tablename', current.tablename);
    gr.query();

    if (gr.next()) {
        var policyName = gr.getValue('name');
        gs.addErrorMessage(gs.getMessage("This policy cannot be created. Policy [{0}] already exists for [{1}] table.", [policyName, current.tablename]));
        current.setAbortAction(true);
    }

})(current, previous);
