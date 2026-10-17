var writeAuditOOBACLList = ['2e76e534c3722010ea04a5a1d840dd81'];
function empty_acl_fix(writeAuditOOBACLList) {
	new global.AccessControlUtils().deleteCustomerUpdatesForAuditedEmptyACLs(writeAuditOOBACLList);
}
empty_acl_fix(writeAuditOOBACLList);
