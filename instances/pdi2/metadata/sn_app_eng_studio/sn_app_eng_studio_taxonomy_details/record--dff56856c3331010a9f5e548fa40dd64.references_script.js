(function dataRetrievalScript(applicationIds) {
    var aclRoleRecords = new GlideRecord('sys_security_acl_role');
    var aclRecords = aclRoleRecords.addJoinQuery('sys_security_acl', 'sys_security_acl', 'sys_id');

    // And the sys_security_acl is in the scope of the passed applicationIds
    aclRecords.addCondition('sys_scope', 'IN', applicationIds);

    // Query
    aclRoleRecords.query();

    var validRoles = {};

    while (aclRoleRecords.next()) {
        validRoles[aclRoleRecords.getValue('sys_user_role')] = true;

    }

    var uniqueRoles = Object.keys(validRoles);
    var roleRecords = new GlideRecord('sys_user_role');
    roleRecords.addQuery('sys_id', 'IN', uniqueRoles);

    // Where the sys_user_role record is not in the scope of the passed applicationIds
    roleRecords.addQuery('sys_scope', 'NOT IN', applicationIds);

    roleRecords.query();

    return roleRecords;
})(sysIds);
