/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const selectedRecordType = api.state.selectedRecordType;
    const params = {};
    const fields = {
        "table": api.context.props.table,
        "sysId": api.context.props.sysId
    };
    helpers.modal.close();
    // Open in sub-tab
    if (api.context.props.parentTable !== "" && api.context.props.parentSysId !== "") {
        let domain = api.state.parentDomain;
        params.query = api.context.props.referencedFieldName+"="+api.context.props.parentSysId+"^"+"sys_domain="+domain+"^"+selectedRecordType.values;
        api.emit("NAV_ITEM_SELECTED", {
            "route": "record",
            "fields": {
                "table": api.context.props.table, 
                "sysId": api.context.props.sysId
            },
            "params": params,
            "parent": {
                "route": "record",
                "fields": {
                    "table": api.context.props.parentTable, 
                    "sysId": api.context.props.parentSysId 
                }
            },
            "redirect": "false",
            "passiveNavigation": "",
            "title": "",
            "multiInstField": "",
            "external": ""
        });
    } else {
        // Open as main tab
        params.query = selectedRecordType.values;
    
        helpers.navigate.to("record", fields, params);
    }
}
