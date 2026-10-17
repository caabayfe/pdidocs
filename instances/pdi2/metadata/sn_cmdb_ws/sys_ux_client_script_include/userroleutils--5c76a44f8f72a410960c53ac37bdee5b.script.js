/**	
 * userRoleUtils	
 * @param args	
 * @return {{hasCmdbAdminOrAdminOrMaint: (function(*): boolean)}}	
 */	
function include() {	
	const CMDB_ADMIN = 'sn_cmdb_admin';	
	const CMDB_EDITOR = 'sn_cmdb_editor';	
        const MS_ADMIN = 'cmdb_ms_admin';
        const MS_EDITOR = 'cmdb_ms_editor';
        const MS_USER = 'cmdb_ms_user';
        const DATA_MANAGER_ADMIN = 'data_manager_admin';
        const CMDB_MANUAL_CI_IRE_ACCESS = 'cmdb_manual_ci_ire_access';
        const CONFIG_ADMIN = 'sn_cmdb_ws.config_admin';
        const CONFIG_EDITOR = 'sn_cmdb_ws.config_editor';
	const ADMIN = 'admin';	
	const MAINT = 'maint';	
        const ITIL = 'itil';
        const ITIL_ADMIN = 'itil_admin';
        const ASSET = 'asset';
        const CMDB_INST_ADMIN = 'cmdb_inst_admin';
	return {		
		hasCmdbEditor: function (roles) {	
			return roles.includes(CMDB_EDITOR);	
		},	
		hasMsUser: function (roles) {	
			return roles.includes(MS_USER);	
		},	
		hasMsEditor: function (roles) {	
			return roles.includes(MS_EDITOR);	
		},	
		hasMsAdmin: function (roles) {	
			return roles.includes(MS_ADMIN);	
		},	
                hasItil: function(roles) {
                         return roles.includes(ITIL);
                },
                hasDataManagerAdminOrAdminOrMaint: function(roles) {
                          return roles.includes(DATA_MANAGER_ADMIN) || roles.includes(ADMIN) || roles.includes(MAINT);
                },
                hasManualCiIRERole: function(roles) {
                          return roles.includes(CMDB_MANUAL_CI_IRE_ACCESS) || roles.includes(CMDB_EDITOR) || roles.includes(ADMIN) || roles.includes(MAINT);
                },
                hasConfigAdmin: function(roles) {
                          return roles.includes(CONFIG_ADMIN) || roles.includes(ADMIN) || roles.includes(MAINT);
                },
                hasConfigEditor: function(roles) {
                          return roles.includes(CONFIG_EDITOR) || roles.includes(ADMIN) || roles.includes(MAINT);
                },
		hasCmdbAdminOrAdminOrMaint: function (roles) {
			return roles.includes(CMDB_ADMIN) || roles.includes(ADMIN) || roles.includes(MAINT);	
		},
               hasAdminOrMaint: function (roles) {	
			return roles.includes(ADMIN) || roles.includes(MAINT);	
		},
               hasCmdbInstAdmin: function(roles) {
                        return roles.includes(CMDB_INST_ADMIN);       
               }
	};	
}
