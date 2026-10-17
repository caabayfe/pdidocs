var AppShellBreadcrumbMenuProvider = Class.create();
AppShellBreadcrumbMenuProvider.prototype = {
    initialize: function() {
    },

	getAppId: function () {
        /** fill this value with your sys_ux_page_registry */
        return "<-- **** sys_ux_page_registry sysId *** -->";
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
        return [];
    },

    type: 'AppShellBreadcrumbMenuProvider'
};
