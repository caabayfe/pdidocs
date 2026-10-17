/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let enableReportButton = event.payload.data.output.has_schedule;
    if(enableReportButton && event.payload.data.output.schedule && !event.payload.data.output.schedule.active)
        enableReportButton = false;
    api.setState('enableCreateReportButton' , enableReportButton);

    if(enableReportButton) {
        const createReportButtonToolTip = await helpers.translate('Create Report');
            api.setState('createReportButtonToolTip', createReportButtonToolTip);
    } else {
        const createReportButtonToolTip = await helpers.translate('A schedule is required before you can create a report');
            api.setState('createReportButtonToolTip', createReportButtonToolTip);  
    }
}
