async function script({api, event, helpers, imports}) {
    const {
        handleLinkClick,
        CMDB_TABLE_NAMES,
        LINK_TYPES,
        PAGE_ROUTES,
        HREF_FOR_ROUTE_TYPE
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    let userOrGroupsFieldDisplayValue = ""
    const baseFilter = "stateIN1,2";
    let tasksFilter = "";
    if (event.payload.row.rowData.value.has("user_group")) {
        userOrGroupsFieldDisplayValue = event.payload.row.rowData.value.get("user_group").columnData.displayValue;
        const fieldValue = event.payload.row.rowData.value.get("user_group").columnData.value;
        tasksFilter = `${baseFilter}^assignment_group=${fieldValue}`;
    } else if (event.payload.row.rowData.value.has("user")) {
        userOrGroupsFieldDisplayValue = event.payload.row.rowData.value.get("user").columnData.displayValue;
        const fieldValue = event.payload.row.rowData.value.get("user").columnData.value;
        tasksFilter = `${baseFilter}^assigned_to=${fieldValue}`;
    }

    const value = {
        type: LINK_TYPES.ROUTE,
        href: HREF_FOR_ROUTE_TYPE,
        openNewWindow: false,
        route: {
            route: PAGE_ROUTES.LIST,
            fields: {
                table: CMDB_TABLE_NAMES.CMDB_DATA_MANAGEMENT_TASK
            },
            params: {
                listTitle: await helpers.translate("Tasks assigned to {0}", userOrGroupsFieldDisplayValue),
                fixedFilter: tasksFilter,
                view: 'cmdb_ws',
                hideActions: true
            }
        }
    };

    handleLinkClick(helpers, value);
}
