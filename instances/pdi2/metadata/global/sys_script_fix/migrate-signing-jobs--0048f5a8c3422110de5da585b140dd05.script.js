(function() {
    if (pm.isZboot())
        return;
    var oldSigningJobTable = 'sys_mass_encryption_job';
    var newSigningJobTable = 'sys_signing_job';
    var gr = new GlideRecord(oldSigningJobTable);
    if (!gr.isValid())
        return;
    gr.addEncodedQuery('sys_class_name=sys_mass_encryption_job^type=mass_sign_records^ORtype=mass_sign_attachments^ORtype=sign_update_set^state=new');
    gr.query();
    while (gr.next()) {
        gr.autoSysFields(false);
        gr.setWorkflow(false);
        gr.sys_class_name = newSigningJobTable;
        gr.update();
        gs.log(gs.getMessage('Migrated signing job record, name: {0}, sys_id: {1}, state: {2}, type: {3}', [gr.getValue('name'), gr.getUniqueValue(), gr.getValue('state'), gr.getValue('type')]));
    }
})();
