var CMDBWorkspaceBreadcrumbItemsProvider = Class.create();
CMDBWorkspaceBreadcrumbItemsProvider.prototype = {
    initialize: function() {},

    /**
     * @param {{
     * appId: string,
     * route: string,
     * fields: Record<string, any>,
     * params: Record<string, any>,
     * fetchStaticRoutes: boolean,
     * selectedToolbarItem: { 
     *  availability: any, badge: any, group?: string, 
     * 	icon?: string, id: string,
     * 	label: string | { message: string, translatable: boolean},
     * 	order?: number, presence?: any,
     * 	routeInfo: {route: string, fields: Record<string, any>, params?: Record<string, any>}
     * }
     * prevBreadcrumbRoute: { route: string, fields?: Record<string, any>, params?: Record<string, any>},
     * prevSelectedContent: { route: string, fields?: Record<string, any>, params?: Record<string, any>}
     * }} context
     * @returns {{
     *		operation?: "REPLACE" | "APPEND" | "REPLACE_LAST_ITEM",
     * 		items: Array<{
     * 					label: string,
     * 					icon?: string,
     *					routeInfo: {
     *						route: string,
     *						fields: Record<string, any>
     *						params: Record<string,any>,
     *						targetRoute?: "current" | { route: string, fields?: Record<string, any>, params?: <string,any> }
     * 					},
     *					operation?: "REPLACE" | "APPEND" | "REPLACE_LAST_ITEM"
     * 				>}}
     */
    provideItems: function(context) {
        var route = context.route;
        if (CMDBWsAdvisorUtil.isAdvisorPluginActive() && CMDBWsAdvisorUtil.isRouteInAdvisorScope(route) && (typeof CMDBWsAdvisorUtil.getAdvisorProvideItems === "function")) {
            return CMDBWsAdvisorUtil.getAdvisorProvideItems(context);
        }
        return new sn_cmdb_ws.CMDBWorkspaceNavigationUtil().provideItems(context);
    },
    getAppId: function() {
        return new sn_cmdb_ws.CMDBWorkspaceNavigationUtil().CMDB_WS_APP.PAGE_REGISTRY_ID;
    },
    getHandledRoutes: function() {
        return new sn_cmdb_ws.CMDBWorkspaceNavigationUtil().CMDB_WS_APP.L1_ROUTES;
    },

    /**
     * @param {{
     * appId: string,
     * route: string,
     * fields: Record<string, any>,
     * params: Record<string, any>,
     * fetchStaticRoutes: boolean,
     * selectedToolbarItem: { 
     *  availability: any, badge: any, group?: string, 
     * 	icon?: string, id: string,
     * 	label: string | { message: string, translatable: boolean},
     * 	order?: number, presence?: any,
     * 	routeInfo: {route: string, fields: Record<string, any>, params?: Record<string, any>}
     * }
     * prevBreadcrumbRoute: { route: string, fields?: Record<string, any>, params?: Record<string, any>},
     * prevSelectedContent: { route: string, fields?: Record<string, any>, params?: Record<string, any>}
     * }} context
     * @returns {Array<{
     * 		items: Array<{
     * 					label: string,
     * 					icon?: string,
     *					routeInfo: {
     *						route: string,
     *						fields: Record<string, any>
     *						params: Record<string,any>,
     *						targetRoute?: "current" | { route: string, fields?: Record<string, any>, params?: <string,any> }
     * 					},
     *					operation?: "REPLACE" | "APPEND" | "REPLACE_LAST_ITEM"
     * 				>}>}
     */
    getStaticRoutes: function(context) {
        /**
         * Return All your static routes from here
         */
        return {
            items: []
        };
    },
    type: 'CMDBWorkspaceBreadcrumbItemsProvider'
};
