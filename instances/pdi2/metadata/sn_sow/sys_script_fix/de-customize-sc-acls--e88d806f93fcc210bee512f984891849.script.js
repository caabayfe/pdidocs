var writeAuditOOBACLList = ['b0557a78c3c33010965e070e9140dd4f'];
empty_acl_fix(writeAuditOOBACLList);

function empty_acl_fix(writeAuditOOBACLList) {
	new global.AccessControlUtils().deleteCustomerUpdatesForAuditedEmptyACLs(writeAuditOOBACLList);
}
