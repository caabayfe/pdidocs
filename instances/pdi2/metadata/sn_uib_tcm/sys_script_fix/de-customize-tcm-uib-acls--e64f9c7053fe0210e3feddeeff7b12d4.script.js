var writeAuditOOBACLList = ['06f258a9432131100bd09f18d9b8f287', '2b5d99e5473875103f3fd922736d430e'];
empty_acl_fix(writeAuditOOBACLList);

function empty_acl_fix(writeAuditOOBACLList) {
    new global.AccessControlUtils().deleteCustomerUpdatesForAuditedEmptyACLs(writeAuditOOBACLList);
}
