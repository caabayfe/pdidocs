/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let output = api.data && api.data.rca_record_lookup && api.data.rca_record_lookup.output || null;
    let rcaResults = output.data.GlideRecord_Query.sys_restricted_caller_access._results;
    if (rcaResults.length != 1) {
        return;
    }

    let rcaRecordStatusValue = rcaResults[0].status.value;
    // 0 - Requested Status
    // 2 - Allowed
    if (rcaRecordStatusValue == 2) {
        return;
    }

    // Turn off Generate button to prevent issues
    api.setState('rcaRecordAlert.isRcaRecordApproved', false);
    let recordSysId = rcaResults[0].sys_id.value;
    // Show RCA alert with link to this record
    let href = 'sys_restricted_caller_access.do?sys_id=' + recordSysId;
    api.setState('rcaRecordAlert', {isRcaRecordApproved: false, isAlertShowing: true, header: "You must approve access by changing the status in the Restricted Caller Access record before generating the certificate", link: {label: "View record", href: href}});
}
