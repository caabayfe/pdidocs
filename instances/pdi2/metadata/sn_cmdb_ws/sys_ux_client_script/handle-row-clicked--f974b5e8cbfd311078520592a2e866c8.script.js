async function script({api, event, helpers, imports}) { 
     const {
        handleLinkClick,
        LINK_TYPES,
        PAGE_ROUTES,
        HREF_FOR_ROUTE_TYPE
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

   var title = event.payload.row.rowData.value.get('ci').columnData.displayValue;

    const value = {
        type: LINK_TYPES.ROUTE,
        href: HREF_FOR_ROUTE_TYPE,
        openNewWindow: false,
        route: {
            route: PAGE_ROUTES.RECORD,
            fields: {
                sysId: event.payload.sys_id,
                 table: event.payload.table
            },
            title: title,
            targetRoute: "current"
        }
    };

    handleLinkClick(helpers, value);

 }
