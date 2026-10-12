(function executeRule(current, previous /*null when async*/) {
	var DEFAULT_ACL_DESCRIPTION = 'Default allow ACL auto-created for auth_server_connection with restricted mode disabled';
	var ACL_TYPE_AUTH_SCOPE = '4b940bd3b7533210c63c06dd1e11a92b';
	var SECURITY_ATTR_IS_AUTHENTICATED = '239bdf0c47d23110ba46ff58936d4330';

	var resource = current.getValue('resource');
	if (!resource) {
		gs.warn('Create ACL on restricted_mode false: resource is empty for auth_server_connection ' + current.getUniqueValue());
		return;
	}

	var aclGr = new GlideRecord('sys_security_acl');
	aclGr.addQuery('name', resource);
	aclGr.addQuery('description', DEFAULT_ACL_DESCRIPTION);
	aclGr.addQuery('type', ACL_TYPE_AUTH_SCOPE);
	aclGr.setLimit(1);
	aclGr.query();

	if (aclGr.next()) {
		if (aclGr.getValue('active') != 'true') {
			aclGr.setValue('active', 'true');
			aclGr.update();
			gs.info('Create ACL on restricted_mode false: reactivated default allow ACL for resource: ' + resource);
		}
	} else {
		var newAcl = new GlideRecord('sys_security_acl');
		newAcl.initialize();
		newAcl.setValue('type', ACL_TYPE_AUTH_SCOPE);
		newAcl.setValue('name', resource);
		newAcl.setValue('decision_type', 'allow');
		newAcl.setValue('operation', 'execute');
		newAcl.setValue('security_attribute', SECURITY_ATTR_IS_AUTHENTICATED);
		newAcl.setValue('sys_policy', 'read');
		newAcl.setValue('admin_overrides', 'true');
		newAcl.setValue('active', 'true');
		newAcl.setValue('description', DEFAULT_ACL_DESCRIPTION);
		var sysId = newAcl.insert();
		if (sysId) {
			gs.info('Create ACL on restricted_mode false: created default allow ACL for resource: ' + resource + ' with sys_id: ' + sysId);
		} else {
			gs.error('Create ACL on restricted_mode false: failed to create default allow ACL for resource: ' + resource);
		}
	}
})(current, previous);
