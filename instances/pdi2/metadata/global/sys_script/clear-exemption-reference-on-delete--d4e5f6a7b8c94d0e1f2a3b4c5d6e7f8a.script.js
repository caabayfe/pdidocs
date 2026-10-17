(function executeRule(current, previous /*null when async*/) {
    var incompatible = new GlideRecord('sys_gs_incompatible_scripts');
    incompatible.addQuery('exemption', current.getUniqueValue());
    incompatible.query();
    while (incompatible.next()) {
        incompatible.setValue('exemption', '');
        incompatible.setWorkflow(false);
        incompatible.update();
    }
})(current, previous);
