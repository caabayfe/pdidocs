/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  
    function fetchAccessComparisonRecord() {
        
        if (event.payload.recordTable == "sn_access_analyzer_access_comparison_request") {
            api.setState("accessComparisonRecordId", event.payload.row.sys_id.value);
            if(api.state.accessComparisonRecordId == event.payload.row.sys_id.value) {
                api.data.access_comparison_record.refresh();
            }
        }
    }
    function navigateToCompareUserPage() {
        var accessComparisonRecord = api.data.access_comparison_record.output.data.GlideRecord_Query.sn_access_analyzer_access_comparison_request._results[0];
        var baseUserRequestId = accessComparisonRecord.user_1_request.value;
        var modelUserRequestId = accessComparisonRecord.user_2_request.value;
        helpers.navigate.to("compare-user", {
            "baseUserRequestId": baseUserRequestId,
            "modelUserRequestId": modelUserRequestId
        });
    }
    ({
        access_comparison_list: fetchAccessComparisonRecord,
        access_comparison_record: navigateToCompareUserPage,
    } [event.elementId])();

}
