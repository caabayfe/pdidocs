(function executeRule(current, previous /*null when async*/) {
    var grName = new GlideRecord('sys_kaa_attribute');
    grName.addQuery('display_name', current.display_name);
    grName.addQuery('target', current.target);
    grName.addQuery('oid', current.oid);
    grName.addQuery('sys_id', '!=', current.sys_id);
    grName.setLimit(1);
    grName.query();
    if (grName.hasNext()) {
        gs.addErrorMessage(gs.getMessage('Configuration already exists with the values display_name:"{0}",OID:"{1}",target attribute:"{2}"',[current.display_name,current.oid,current.target]));
        current.setAbortAction(true);
        return;
    }
})(current, previous);
