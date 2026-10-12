(function executeRule(current, previous /*null when async*/) {
	var DEFAULT_ACL_DESCRIPTION = 'Default allow ACL auto-created for auth_server_connection with restricted mode disabled';
	var ACL_TYPE_AUTH_SCOPE = '4b940bd3b7533210c63c06dd1e11a92b';

	var resource = current.getValue('resource');
	if (!resource) {
		gs.warn('Deactivate Default ACL: resource is empty for auth_server_connection ' + current.getUniqueValue());
		return;
	}

	var aclGr = new GlideRecord('sys_security_acl');
	aclGr.addQuery('name', resource);
	aclGr.addQuery('description', DEFAULT_ACL_DESCRIPTION);
	aclGr.addQuery('type', ACL_TYPE_AUTH_SCOPE);
	aclGr.setLimit(1);
	aclGr.query();

	if (aclGr.next()) {
		aclGr.setValue('active', 'false');
		aclGr.update();
		gs.info('Deactivate Default ACL: deactivated default allow ACL for resource: ' + resource);
	} else {
		gs.warn('Deactivate Default ACL: no default allow ACL found for resource: ' + resource);
	}
})(current, previous);
