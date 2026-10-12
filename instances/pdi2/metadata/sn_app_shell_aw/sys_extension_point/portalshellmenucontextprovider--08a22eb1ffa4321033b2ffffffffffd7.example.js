var PortalShellMenuContextProvider = Class.create();
PortalShellMenuContextProvider.prototype = {
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
	/**
	 * Label: action button label
	 * Size: sm | md | lg
	 * variant: now-button variants.
	 *
	 * @returns  {[{
	 * 		label: string,
	 * 		value: string,
	 * 		size: string,
	 * 		variant: string
	 * }]}
	 */
	provideActionButtons: function() {
		return [];
	},
    type: 'PortalShellMenuContextProvider'
};
