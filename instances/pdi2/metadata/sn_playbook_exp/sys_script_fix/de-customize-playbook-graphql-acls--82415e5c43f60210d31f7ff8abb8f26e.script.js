var writeAuditOOBACLList = ['cdc63289a3123110f1f52780f31e61c1'];
empty_acl_fix(writeAuditOOBACLList);

function empty_acl_fix(writeAuditOOBACLList) {
    new global.AccessControlUtils().deleteCustomerUpdatesForAuditedEmptyACLs(writeAuditOOBACLList);
}
