(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('sys_development_permission_set');
    gr.addQuery('type', 'permission_restricted');
    gr.query();

    var pm2mGr = new GlideRecord('sys_appcollab_permission_m2m');
    var descriptorId = current.descriptor;

    while (gr.next()) {
        var permissionId = gr.sys_id;

        pm2mGr.initialize();
        pm2mGr.addQuery('descriptor', descriptorId);
        pm2mGr.addQuery('permission', permissionId);
        pm2mGr.query();

        if (!pm2mGr.hasNext()) {
            pm2mGr.initialize();
            pm2mGr.setWorkflow(false);
            pm2mGr.descriptor = descriptorId;
            pm2mGr.permission = permissionId;
            pm2mGr.insert();
        }
    }

})(current, previous);
