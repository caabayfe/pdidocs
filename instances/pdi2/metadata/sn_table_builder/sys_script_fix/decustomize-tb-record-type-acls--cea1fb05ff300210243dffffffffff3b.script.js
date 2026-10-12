var writeAuditOOBACLList = ['c941b97f536310106c4bddeeff7b12de', 'b350bd3f536310106c4bddeeff7b1299', '4301357f536310106c4bddeeff7b1290', '1551f97f536310106c4bddeeff7b12cb'];

empty_acl_fix(writeAuditOOBACLList);

function empty_acl_fix(writeAuditOOBACLList) {
    new global.AccessControlUtils().deleteCustomerUpdatesForAuditedEmptyACLs(writeAuditOOBACLList);
}
