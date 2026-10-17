var UserDelegatedDevPermissions = (function() {
	return {
		
		// Returns list of permission sets and roles for a given scopeId
		getPermissionSetsGrantedToUserFromScope: function(scopeId) {
			var currentUserSysId = gs.getUserID();
			var collabReqUtils = new CollabReqUtils();
			var permSetRoleList = [];
			var scopePermSetRoleAssignmentTable = new GlideRecord('sys_scope_permission_set_role_assignment');
			var userHasRoleJoinQueryCondition = scopePermSetRoleAssignmentTable.addJoinQuery('sys_user_has_role', "role", "role");
			
			userHasRoleJoinQueryCondition.addCondition("user", currentUserSysId);
			scopePermSetRoleAssignmentTable.addQuery("scope", scopeId);
			scopePermSetRoleAssignmentTable.query();
			
			while(scopePermSetRoleAssignmentTable.next()) {
				var permSetRoleObj = collabReqUtils.getObjectFromGlideRecord(scopePermSetRoleAssignmentTable, ['role', 'permission_set']);
				var permissionName = "";
				var developmentPermSetTable = scopePermSetRoleAssignmentTable.permission_set.getRefRecord();
				if (developmentPermSetTable.isValidRecord()) {
					permissionName = developmentPermSetTable.getValue("name");
					permSetRoleObj["permission_name"] = permissionName;
					permSetRoleList.push(permSetRoleObj);
				}
			}

			return permSetRoleList;
		},
		getPermSetNamesAndIdsFromObj: function(permissionsGranted) {
			var grantedPermSetNameAndId = {};
			permissionsGranted.forEach( function(permSetAndRole) {
				var permSetId = permSetAndRole["permission_set"];
				grantedPermSetNameAndId[permSetId] = permSetAndRole["permission_name"];
			});
			
			return grantedPermSetNameAndId;
		},
		
		throwAppNotFound: function(appId) {
			throw new sn_ws_err.ServiceError()
				.setStatus(404)
				.setMessage(appId ? gs.getMessage("Could not find the application {0}", appId) : gs.getMessage("Could not find the application"));
		},
		
		isScopeValid: function(scopeId) {
			var appTable = new GlideRecord("sys_app");
			
			if(appTable.get(scopeId)) {
				return appTable.isValid();
			} else {
				var storeAppTable = new GlideRecord("sys_store_app");
				storeAppTable.get(scopeId);
				
				return storeAppTable.isValid();
			}
		},
		
		canUserReadApp: function(appId) {
			var apps = new GlideRecord('sys_app');
			apps.get(appId);
			
			var storeAppTable = new GlideRecord("sys_store_app");
			storeAppTable.get(appId);

            return apps.canRead() || storeAppTable.canRead();
		}
	};
})();
