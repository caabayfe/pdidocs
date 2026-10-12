var RequestAppRolesService = Class.create();
RequestAppRolesService.prototype = {
    initialize: function() {
    },

	/*
		Creates sys_user_role_contains records
	*/
	createContainsRoles(roleSysId, containsRoles = []) {
		const createdSysIds = [];
		const failed = [];
		const csDataProxy = new global.CreatorStudioDataProxy();
		
		containsRoles.forEach((containsRole) => {
			const grContainedRole = new GlideRecordSecure("sys_user_role_contains");
			grContainedRole.initialize();

			const insertedId = csDataProxy.insert(grContainedRole, {
				role: roleSysId,
				contains: containsRole
			});

			if (insertedId) {
				createdSysIds.push(insertedId);
			} else {
				failed.push(containsRole);
			}
		});

		return {
			success: createdSysIds,
			failed,
			hasError: failed.length > 0,
		};
	},

    type: 'RequestAppRolesService'
};
