var writeAuditOOBACLList = ['8e4aaa25c3731110cf33ad413b40dd58'];
empty_acl_fix(writeAuditOOBACLList);

function empty_acl_fix(writeAuditOOBACLList) {
    new global.AccessControlUtils().deleteCustomerUpdatesForAuditedEmptyACLs(writeAuditOOBACLList);
}
