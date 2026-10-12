(function executeRule(current, previous /*null when async*/ ) {

    var pm2mGr = new GlideRecord('sys_appcollab_permission_m2m');
    pm2mGr.addQuery('descriptor', current.descriptor);
    pm2mGr.addQuery('permission', current.permission);
    pm2mGr.query();

    if (pm2mGr.getRowCount() > 0)
        current.setAbortAction(true);

})(current, previous);
