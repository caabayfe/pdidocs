var CMDBWorkspaceAppShellBreadcrumbMenuProvider = Class.create();
CMDBWorkspaceAppShellBreadcrumbMenuProvider.prototype = {
    initialize: function() {
    },
	
	getAppId: function () {
        /** fill this value with your sys_ux_page_registry */
        return new sn_cmdb_ws.CMDBWorkspaceNavigationUtil().CMDB_WS_APP.PAGE_REGISTRY_ID;
    },

	/**
	 * @returns {[{
	 * 			value: {
	 * 				label: string,
	 * 				target: string,
	 * 				type: string,
	 * 				value: {
	 * 					route: string,
	 *					field: Record<string, any> 
	 *              }		
	 * 	        }
	 * }]}
	 */
    provideMenuItems: function() {
        return new sn_cmdb_ws.CMDBWorkspaceNavigationUtil().provideMenuItems();
    },

    type: 'CMDBWorkspaceAppShellBreadcrumbMenuProvider'
};
