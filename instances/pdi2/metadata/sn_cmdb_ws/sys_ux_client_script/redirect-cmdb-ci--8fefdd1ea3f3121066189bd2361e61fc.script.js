/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.check_cmdb_ci_extension?.output?.result 
        && api.data.check_cmdb_ci_extension?.output?.properties?.isExploreCiEnabled) {
        let {
            sysId,
            table
        } = api.context.props;
        if (sysId == "-1") {
            api.setState("hidePageContent", false);
            return;
        }
        const customPayload = {
            "route": "ci-record",
            "fields": {
                table: table,
                sysId: sysId
            },
            "redirect": true,
            "targetRoute": "current"
        };
        
        api.emit('NAV_ITEM_SELECTED', customPayload);
    } else {
        // Lazy load record page content and call data brokers
        api.data.lifeCycleStage.refresh();
        api.data.check_cmdb_assist_summarize_status.refresh();
        api.setState("hidePageContent", false);
    }
}
