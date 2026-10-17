/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var subHeading, parent = "record-info-",
        userSysId, param = {};
    var requestedForInfo = api.data.record_information__request_1.output.sourceInfo;
    if(api.data.record_information__request_1.output.openedByInfo){
        var openedByInfo = api.data.record_information__request_1.output.openedByInfo;
        userSysId = openedByInfo.userInfo.sysId;
    }
    subHeading = api.state.openedByContactField[0].label;
    param = {
        viewportElementId: "viewport_1",
        route: "contact-card",
        fields: {
            "table": api.context.props.table,
            "recordSysId": api.context.props.sysId,
            "userSysId": userSysId
        },
        params: {
            "subTitle": subHeading,
            "parent": parent + api.context.props.table,
            "isCtiEnabled": api.data.record.isCtiEnabled,
        }
    };
    if (event.elementId == "requested_for_contact_button") {
        userSysId = requestedForInfo.requestorInfo.sysId;
        subHeading = api.state.requestorContactField[0].label;
        param.fields.userSysId = userSysId + "";
        param.params.subTitle = subHeading + "";
    } else if (event.elementId == "get_caller_records_1") {
        var data = api.data.get_caller_records_1.output;
        var linkTable = api.state.linkTable;
        var emptyStateAndLabel, subTitle;
        if (linkTable == "alm_asset") {
            subTitle = await helpers.translate("Assigned assets");
            emptyStateAndLabel = {
                "label": await helpers.translate("No assets"),
                "state": data.length > 0
            };
        } else if (linkTable == "sc_request") {
            subTitle = await helpers.translate("Recent requests");
            emptyStateAndLabel = {
                "label": await helpers.translate("No recent requests"),
                "state": data.length > 0
            };
        }
        param = {
            viewportElementId: "viewport_1",
            route: "caller-records",
            fields: {
                "table": api.state.linkTable,
                "recordSysId": api.context.props.sysId,
                "userSysId": requestedForInfo.requestorInfo.sysId,
                "callerRecords": data
            },
            params: {
                "subTitle": subTitle,
                "parent": parent + api.context.props.table,
                "emptyStateAndLabel": emptyStateAndLabel
            }
        };
    }
    api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", param);
    api.setState("hideViewport", false);
}
