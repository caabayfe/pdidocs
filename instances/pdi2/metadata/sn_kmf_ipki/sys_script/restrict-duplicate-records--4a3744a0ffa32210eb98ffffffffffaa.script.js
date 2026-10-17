(function executeRule(current, previous /*null when async*/ ) {
    var grName = new GlideRecord('sn_kmf_ipki_service');
    grName.addQuery('display_name', current.display_name);
    grName.addQuery('oid', current.oid);
    grName.addQuery('sys_id', '!=', current.sys_id);
    grName.setLimit(1);
    grName.query();
    if (grName.hasNext()) {
         gs.addErrorMessage(gs.getMessage('Service with the Display name "{0}" and OID "{1}" is already exists.',[current.display_name,current.oid]));
        current.setAbortAction(true);
        return;
    }
})(current, previous);
