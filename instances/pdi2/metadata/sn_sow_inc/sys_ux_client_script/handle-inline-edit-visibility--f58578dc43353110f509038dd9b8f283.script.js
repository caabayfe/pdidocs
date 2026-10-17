/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.elementId == 'edit_button') {
        api.setState('isContributorsEditModeOn', true);
    } else if (event.elementId === 'report_edit_button') {
        api.setState('isReportSummaryEditMode', true);
        api.setState('disableIncidentSummarySave', true);
        api.setState('incidentSummaryViewConfig', {
            ...api.state.incidentSummaryViewConfig,
            expanded: true,
            isEdit: true
        });
    } 
    else if(event.elementId === 'report_save_button') {
        api.setState('isReportSummaryEditMode', false);
        api.setState('incidentSummaryViewConfig', {
            ...api.state.incidentSummaryViewConfig,
            isEdit: false
        });
    }
    else if(event.elementId === 'close_report_button') {
        api.setState('isReportSummaryEditMode', false);
        api.setState('incidentSummaryViewConfig', {
            ...api.state.incidentSummaryViewConfig,
            isEdit: false
        });
    }
    else {
        api.setState('isContributorsEditModeOn', false);
    }
    
}
