(function executeRule(current, previous /*null when async*/ ) {
    var acl = current.security_acl;
    var gr = new GlideRecord('ais_acl_overrides');
    gr.addQuery('security_acl', acl);
    gr.query();

    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Acl has overrides already"));
        current.setAbortAction(true);
    }

})(current, previous);
