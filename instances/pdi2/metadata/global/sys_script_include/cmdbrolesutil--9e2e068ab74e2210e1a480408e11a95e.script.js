var CMDBRolesUtil = Class.create();
CMDBRolesUtil.prototype = {
	initialize: function() {
	},

	ROLES: {
		ITIL: 'itil',
		ITIL_ADMIN: 'itil_admin',
		SN_CMDB_ADMIN: 'sn_cmdb_admin',
		SN_CMDB_EDITOR: 'sn_cmdb_editor'
	},

	CMDB_CI: {
		TABLE: 'cmdb_ci'
	},

	SYS_SECURITY_ACL: {
		TABLE: 'sys_security_acl',
		NAME: 'name',
		DESCRIPTION: 'description',
		TYPE: 'type',
		ACTIVE: 'active',
		OPERATION: 'operation',
		DECISION_TYPE: 'decision_type',
		TYPE_OPTIONS: {
			RECORD: 'record'
		},
		DECISION_TYPE_OPTIONS: {
			ALLOW: 'allow'
		}
	},

	SYS_SECURITY_ACL_ROLE: {
		TABLE: 'sys_security_acl_role',
		SYS_USER_ROLE: 'sys_user_role',
		SYS_SECURITY_ACL: 'sys_security_acl'
	},

	SYS_USER_ROLE_CONTAINS: {
		TABLE: 'sys_user_role_contains'
	},

	SYS_USER_ROLE: {
		TABLE: 'sys_user_role',
		NAME: 'name'
	},

	OPERATIONS: {
		CREATE: 'create',
		WRITE: 'write',
		DELETE: 'delete'
	},

	removeContainsRole: function(containsRole, parentRole){
		let grContains = new GlideRecord(this.SYS_USER_ROLE_CONTAINS.TABLE);
		grContains.addEncodedQuery("contains.name=" + containsRole +"^role.name="+ parentRole);
		grContains.query();
		if (grContains.next()) {
			grContains.deleteRecord();
			gs.info('CMDBRolesUtil: Remove ' + containsRole + ' role from ' + parentRole + ' role');
		}
	},

	createACLIfNotExists: function(table, operations, roleName){
		const roleId = this.getRoleByName(roleName); 

		for (var i = 0; i < Object.keys(operations).length; i++) { 
			var operation = Object.keys(operations)[i]; 
			if (roleId && !this.checkACLExistsWithRole(table, operations[operation], roleId, roleName)) {
				this.createACL(table, operations[operation], roleId, roleName); 
			}
		} 
	}, 

	getRoleByName: function(name){
		let gr = new GlideRecord(this.SYS_USER_ROLE.TABLE);
		if (gr.get(this.SYS_USER_ROLE.NAME, name))
			return gr.getUniqueValue();
		return null;
	},

	createACL: function(table, operation, roleId, roleName) { 
		let gr = new GlideRecord(this.SYS_SECURITY_ACL.TABLE); 
		gr.initialize(); 
		gr.setValue(this.SYS_SECURITY_ACL.NAME, table); 
		gr.setValue(this.SYS_SECURITY_ACL.DESCRIPTION, "Allow " + operation + " for records in " + table + ", for users with role " + roleName + "."); 
		gr.setValue(this.SYS_SECURITY_ACL.TYPE, this.SYS_SECURITY_ACL.TYPE_OPTIONS.RECORD); 
		gr.setValue(this.SYS_SECURITY_ACL.ACTIVE, true); 
		gr.setValue(this.SYS_SECURITY_ACL.OPERATION, operation); 
		gr.setValue(this.SYS_SECURITY_ACL.DECISION_TYPE, this.SYS_SECURITY_ACL.DECISION_TYPE_OPTIONS.ALLOW); 
		gr.insert();  
		const aclId = gr.getUniqueValue();
		gs.info('CMDBRolesUtil: ACL on ' + table + ' for operation ' + operation + ' created successfully.'); 

		if (aclId) {
			let aclRoleGR = new GlideRecord(this.SYS_SECURITY_ACL_ROLE.TABLE);
			aclRoleGR.initialize(); 
			aclRoleGR.setValue(this.SYS_SECURITY_ACL_ROLE.SYS_USER_ROLE, roleId);
			aclRoleGR.setValue(this.SYS_SECURITY_ACL_ROLE.SYS_SECURITY_ACL, aclId);
			aclRoleGR.insert();
			gs.info('CMDBRolesUtil: ACL role on ' + table + ' for operation ' + operation + ' and role ' + roleName + ' created successfully.'); 
		}
	},

	checkACLExistsWithRole: function(table, operation, roleId, roleName) {
		let aclRoleExists = false;
		let aclGr = new GlideRecord(this.SYS_SECURITY_ACL.TABLE);
		aclGr.addQuery(this.SYS_SECURITY_ACL.NAME, table);
		aclGr.addQuery(this.SYS_SECURITY_ACL.TYPE, this.SYS_SECURITY_ACL.TYPE_OPTIONS.RECORD); 
		aclGr.addQuery(this.SYS_SECURITY_ACL.OPERATION, operation);
		aclGr.addQuery(this.SYS_SECURITY_ACL.DECISION_TYPE, this.SYS_SECURITY_ACL.DECISION_TYPE_OPTIONS.ALLOW);
		aclGr.addActiveQuery();
		aclGr.query();
		while(aclGr.next()) {
			if(this.checkACLRoleExists(aclGr.getUniqueValue(), roleId)){
				gs.info('CMDBRolesUtil: ACL role on ' + table + ' for operation ' + operation + ' and role ' + roleName + ' already exists.');
				return true;
			}
		}
		return aclRoleExists;
	},

	checkACLRoleExists: function(aclId, roleId) {
		let aclRoleGr = new GlideRecord(this.SYS_SECURITY_ACL_ROLE.TABLE);
		aclRoleGr.addQuery(this.SYS_SECURITY_ACL_ROLE.SYS_SECURITY_ACL, aclId);
		aclRoleGr.addQuery(this.SYS_SECURITY_ACL_ROLE.SYS_USER_ROLE, roleId);
		aclRoleGr.query();
		return aclRoleGr.hasNext();
	},

	type: 'CMDBRolesUtil'
};
