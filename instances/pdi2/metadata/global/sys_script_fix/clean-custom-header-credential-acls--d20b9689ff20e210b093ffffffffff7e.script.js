(function() {
    //This Fix script should only run for Upgrade not for Zboot.
    if (pm.isZboot())
        return;
    var aclGr = new GlideRecord('sys_security_acl');
    aclGr.addQuery('name', 'sys_generative_ai_custom_header_api_key_credentials').addOrCondition('name', 'sys_generative_ai_custom_header_api_key_credentials.*');
    aclGr.addQuery('operation', 'IN', 'create,delete,write');
    aclGr.query();
    while (aclGr.next()) {
        var rolesUpdatedByCustomer = false;
        var roleGr = getRolesForAcl(aclGr);
        while (roleGr.next()) {
            if (SncAppFiles.hasCustomerUpdate(roleGr)) {
                gs.info('Customer update found for sys_security_acl_role ' + roleGr.getUniqueValue());
                rolesUpdatedByCustomer = true;
            }
        }

        if (!rolesUpdatedByCustomer && !SncAppFiles.hasCustomerUpdate(aclGr)) {
            var rolesForDeletion = getRolesForAcl(aclGr);
            while (rolesForDeletion.next()) {
                gs.info('Deleting sys_security_acl_role ' + rolesForDeletion.getUniqueValue());
                rolesForDeletion.deleteRecord();
            }
            gs.info('Deleting sys_security_acl ' + aclGr.getUniqueValue());
            aclGr.deleteRecord();
        } else {
            gs.info('Customer update found, skipping sys_security_acl ' + aclGr.getUniqueValue());
        }
    }

    function getRolesForAcl(aclGr) {
        var roleGr = new GlideRecord('sys_security_acl_role');
        roleGr.addQuery('sys_security_acl', aclGr.getValue('sys_id'));
        roleGr.query();
        return roleGr;
    }
}());
