var AppShellBreadcrumbItemsProvider = Class.create();
AppShellBreadcrumbItemsProvider.prototype = {
    initialize: function () {
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
     * prevBreadcrumbRoute: {isDirty?: boolean, route: string, fields?: Record<string, any>, params?: Record<string, any>},
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
         *					operation?: "REPLACE" | "APPEND" | "REPLACE_LAST_ITEM",
		 *                  hideBreadcrumb?: boolean,
         * 				>}}
         */
    provideItems: function (context) {
        return {
            items: []
        };
    },
    getAppId: function () {
        /** fill this value with your sys_ux_page_registry */
        return "<-- **** sys_ux_page_registry sysId *** -->";
    },
    getHandledRoutes: function () {
        /** Fill  all this toolbar items routes which this extension point handles */
        return ["home", "list"];
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
     *                  subToolbarOptions?: {
     *                      hideSubToolbar?: boolean,
     *                      viewportInfo?: {
     *                          route: string,
     *                          fields?: Record<string, any>,
     *                          params?: Record<string, any>
     *                      }
     *                  },
     *					operation?: "REPLACE" | "APPEND" | "REPLACE_LAST_ITEM",
	 *                  hideBreadcrumb?: boolean,
     * 				>}>}
     */
    getStaticRoutes: function (context) {
        /**
        * Return All your static routes from here
        */
        return {
            items: []
        };
    },
    type: 'AppShellBreadcrumbItemsProvider'
};
