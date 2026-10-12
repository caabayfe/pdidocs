(function executeRule(current, previous /*null when async*/ ) {

    var grName = new GlideRecord('sn_kmf_ipki_endpoint_attribute');
    grName.addQuery('endpoint', current.endpoint);
    grName.addQuery('attribute', current.attribute);
    grName.addQuery('sys_id', '!=', current.sys_id);
    grName.setLimit(1);
    grName.query();
    if (grName.hasNext()) {
        gs.addErrorMessage(gs.getMessage('Attribute "{0}" with the endpoint "{1}" is already configured',[current.getDisplayValue("attribute"),current.getDisplayValue("endpoint")]));
        current.setAbortAction(true);
        return;
    }
})(current, previous);
