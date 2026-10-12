/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let data = api.data.get_caller_records.output;
    let table = api.context.props.table;
    let emptyStateAndLabel = {...api.state.emptyStateAndLabel};
    emptyStateAndLabel.state = data.length > 0;
    let userSysId = api.context.props.userSysId || api.data.record_information.output.sourceInfo.callerInfo.caller.sysId;
    
    api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", {
        viewportElementId: "viewport_1",
        route: "caller-records",
        fields: {
            "table": api.state.callerQuickLinksTable,
            "recordSysId": api.context.props.recordSysId,
            "userSysId": userSysId,
            "callerRecords": api.data.get_caller_records.output
        },
        params: {
            "subTitle": api.state.callerQuickLinksHeading,
            "parent": "record-info-incident",
            "emptyStateAndLabel": emptyStateAndLabel,
            "parentTable": api.context.props.recordTable
        }
    });
    api.setState("hideCallerViewport",false);
    api.setState("hideLoader",true);
    api.setState("emptyStateAndLabel",emptyStateAndLabel);
}
