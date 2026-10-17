var aclGR = new GlideRecord('sys_security_acl');
if (aclGR.get('51ef5b80733110106c1ddb5f24f6a72f') && aclGR.getValue('sys_mod_count') === '1') {
	// if duplicate ACL record hasn't been modified, it should be safe to delete
	// because it was set to inactive when backported
	aclGR.deleteRecord();
	
	// after removing the duplicate ACL, we should remove the ACL Role associated with it as well
	var aclRoleGR = new GlideRecord('sys_security_acl_role');
	if (aclRoleGR.get('c15167c0733110106c1ddb5f24f6a76a') && aclRoleGR.getValue('sys_mod_count') === '0') {
		aclRoleGR.deleteRecord();
	}
}
