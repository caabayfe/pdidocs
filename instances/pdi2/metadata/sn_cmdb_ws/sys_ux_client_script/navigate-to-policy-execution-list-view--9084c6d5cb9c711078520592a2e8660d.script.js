async function handler({ api, event, helpers, imports }) {
    const {
        handleLinkClick,
        CMDB_TABLE_NAMES,
        LINK_TYPES,
        PAGE_ROUTES,
        HREF_FOR_ROUTE_TYPE
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const value = {
            type: LINK_TYPES.ROUTE,
            href: HREF_FOR_ROUTE_TYPE,
            openNewWindow: false,
            route: {
                route: PAGE_ROUTES.LIST,
                fields : {
                       table: CMDB_TABLE_NAMES.CMDB_DM_POLICY_EXECUTION
                },
                params: {
                       listTitle: await helpers.translate("Policy executions"), 
                       view: 'cmdb_ws',
                       hideActions: true
                }
            }
        };

    handleLinkClick(helpers, value)
}
