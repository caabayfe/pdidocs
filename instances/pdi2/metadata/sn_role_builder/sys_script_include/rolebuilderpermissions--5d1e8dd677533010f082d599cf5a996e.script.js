var RoleBuilderPermissions = (function() {
    return {
		canReadApp: function(appId) {
			var apps = new GlideRecord('sys_app');            
			var appRecordExists = apps.get(appId);

            return appRecordExists && apps.canRead();
		},
        canWriteRoles: function() {
            var tableNames = ["sys_security_acl_role", "sys_security_acl", "sys_user_role"];
            var tableRecord;

            for (var i = 0; i < tableNames.length; i++) {
                tableRecord = new GlideRecord(tableNames[i]);
				
                if (!tableRecord.canCreate()) {
                    return false;
                }
            }

            return true;
        }
    };
})();
