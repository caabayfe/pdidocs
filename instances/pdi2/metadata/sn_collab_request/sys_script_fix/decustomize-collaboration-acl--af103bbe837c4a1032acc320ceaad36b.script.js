var writeAuditOOBACLList = ['8325fc354fd431103e4c2044dd72e04a'];
empty_acl_fix(writeAuditOOBACLList);
function empty_acl_fix(writeAuditOOBACLList) {
    new global.AccessControlUtils().deleteCustomerUpdatesForAuditedEmptyACLs(writeAuditOOBACLList);
}
