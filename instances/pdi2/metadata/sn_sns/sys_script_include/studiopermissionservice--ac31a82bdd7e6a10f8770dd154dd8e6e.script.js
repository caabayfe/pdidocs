class StudioPermissionService {
	static type = 'StudioPermissionService';
	static getUserPermissionRoles(appSysId, scope) {
		const userPermissions = {};
		if (scope !== SNSConstants.GLOBAL_APPLICATION_SCOPE_NAME && !gs.hasRole('sn_udc.admin')) {
			var gr = new GlideRecord('sys_scope_permission_set_role_assignment');
			gr.addQuery('scope', appSysId);
			gr.query();
			while (gr.next()) {
				const permissionLabel = gr.getDisplayValue('role');
				if (gs.hasRole(permissionLabel)) {
					userPermissions[gr.permission_set] = permissionLabel;
				}
			}
		}
		return userPermissions;
	}
	static canUpdateAppProperties(scope, userPermissions, userPermissionKeys) {
		if (gs.hasRole('sn_udc.admin')) {
			return true;
		}
		// Check if user has the delegated_developer role and other delegated permissions
		if (gs.hasRole(SNSConstants.DELEGATED_DEVELOPER_ROLE)) {
			if (userPermissions && userPermissionKeys.length) {
				return (
					userPermissions[
						SNSConstants.permissionSysIds.DELETE_APP_DELEGATED_DEV_PERM_SYS_ID
					] ||
					userPermissions[
						SNSConstants.permissionSysIds.DELEGATED_ADMIN_DELEGATED_DEV_PERM_SYS_ID
					]
				);
			}
		}

		return false;
	}

	static getUserPermissions(appSysId) {
		var record = new GlideRecord(SNSConstants.SCOPE_TABLE);
		record.addQuery('sys_id', appSysId);
		record.query();

		if (record.next()) {
			if (record.canRead()) {
				const className = record.getRecordClassName();
				const scope = record.getValue('scope');
				const userPermissions = StudioPermissionService.getUserPermissionRoles(
					appSysId,
					scope
				);
				const userPermissionKeys = Object.keys(userPermissions);
				const canUpdateAppProperties = StudioPermissionService.canUpdateAppProperties(
					scope,
					userPermissions,
					userPermissionKeys
				);
				return {
					canUpdateAppProperties: canUpdateAppProperties,
					dd_permissions: {
						canPublishWithPipeline: userPermissionKeys.includes(
							SNSConstants.permissionSysIds.SUBMIT_APP_DELEGATED_DEV_PERM_SYS_ID
						),
						canDeleteApp: userPermissionKeys.includes(
							SNSConstants.permissionSysIds.DELETE_APP_DELEGATED_DEV_PERM_SYS_ID
						),
						canPublishWithoutPipeline: userPermissionKeys.includes(
							SNSConstants.permissionSysIds
								.PUBLISH_TO_APP_REPO_DELEGATED_DEV_PERM_SYS_ID
						),
						canPublishToAppStore: userPermissionKeys.includes(
							SNSConstants.permissionSysIds
								.PUBLISH_TO_APP_STORE_DELEGATED_DEV_PERM_SYS_ID
						),
						isUserDelegatedAdmin: userPermissionKeys.includes(
							SNSConstants.permissionSysIds.DELEGATED_ADMIN_DELEGATED_DEV_PERM_SYS_ID
						),
						canAccessSourceControl: userPermissionKeys.includes(
							SNSConstants.permissionSysIds.SOURCE_CONTROL_DELEGATED_DEV_PERM_SYS_ID
						),
					},
				};
			}

			return {
				statusCode: 403,
				error: SNSConstants.errors.APP_ACCESS_ERROR_MESSAGE,
			};
		}

		return {
			statusCode: 404,
			error: SNSConstants.errors.APP_DOES_NOT_EXISTS + ' : ' + appSysId,
		};
	}
}
