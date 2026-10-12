(function(finding) {

    if (GlidePluginManager.isActive('com.sn_hr_lifecycle_events')) {
        var grRoleContains = new GlideRecord('sys_user_role_contains');
        if (grRoleContains.isValid()) {
            grRoleContains.addQuery('role.name', 'IN', 'admin,security_admin');
            grRoleContains.addQuery('contains.name', 'sn_hr_le.admin');
            grRoleContains.query();

            while (grRoleContains.next()) {
                finding.setCurrentSource(grRoleContains);
                finding.increment();
            }
        }
    }

})(finding);
