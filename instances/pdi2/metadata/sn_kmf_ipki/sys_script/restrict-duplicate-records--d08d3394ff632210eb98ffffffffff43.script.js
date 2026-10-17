(function executeRule(current, previous /*null when async*/ ) {

    var grName = new GlideRecord('sn_kmf_ipki_endpoint');
    grName.addQuery('alias', current.alias);
    grName.addQuery('sys_id', '!=', current.sys_id);
    grName.setLimit(1);
    grName.query();
    if (grName.hasNext()) {
        gs.addErrorMessage(gs.getMessage('Endpoint with the alias name "{0}" is already exists.',current.alias));
        current.setAbortAction(true);
        return;
    }
})(current, previous);
