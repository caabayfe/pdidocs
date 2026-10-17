/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('activitiesListSelectedRecords', event.payload.selectedRecords);

    if (api.state.projectIdleTimeEnabled) {
        const { projectActivityDefinitions } = api.state.idleTimeConfiguration;
        const projectADs = projectActivityDefinitions.map(pad => pad.sysId);
        const isIdleTimeMetric = event.payload.selectedRecords.some(i => projectADs.includes(i));
        api.setState("showIdleTimeMetricsConfirmation", isIdleTimeMetric);
    }
}
