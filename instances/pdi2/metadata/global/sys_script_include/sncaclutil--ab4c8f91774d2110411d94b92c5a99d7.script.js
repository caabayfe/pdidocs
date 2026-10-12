var SNCACLUtil = Class.create(); 
SNCACLUtil.prototype = { 
	initialize: function() { 
	},

	getRoleSysID: function(roleName) {
		var role = new GlideRecord('sys_user_role');
		var roleSysId = '';
		role.addQuery('name', roleName);
		role.query();
		if (role.next()) {
			roleSysId = role.getValue('sys_id');
		}
		return roleSysId;
	},

	hasPublicAccess: function(tableName) { 
		var publicRoleSysID = this.getRoleSysID('public');
		if (!publicRoleSysID)
			return false;

		var aclRoleGR = new GlideRecord('sys_security_acl_role');
		var encodedQueryStr = 'sys_user_role=' + publicRoleSysID + '^sys_security_acl.active=true^sys_security_acl.type=record^sys_security_acl.operation=read^sys_security_acl.nameNOT LIKE.';
		aclRoleGR.addEncodedQuery(encodedQueryStr);
		aclRoleGR.addQuery('sys_security_acl.name', tableName);
		aclRoleGR.query();
		return aclRoleGR.hasNext();
	},
	
	type: 'SNCACLUtil'
};
