(function executeRule(current, previous /*null when async*/) {
   var grName = new GlideRecord('sn_kmf_ipki_m2m_endpoint_eku');
    grName.addQuery('endpoint', current.endpoint);
    grName.addQuery('extended_key_usage', current.extended_key_usage);
    grName.addQuery('sys_id', '!=', current.sys_id);
    grName.setLimit(1);
    grName.query();
    if (grName.hasNext()) {
        gs.addErrorMessage(gs.getMessage('Extended key usage "{0}" with the endpoint "{1}" is already configured',[current.getDisplayValue("extended_key_usage"),current.getDisplayValue("endpoint")]));
        current.setAbortAction(true);
        return;
    }
})(current, previous);
