/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('activitiesListSelectedRecords', [api.state.selectedActivityID]);
    const {
        projectIdleTimeEnabled,
        idleTimeConfiguration: {
            fields,
            projectActivityDefinitions,
        }
    } = api.state;

    if (projectIdleTimeEnabled) {
        const projectADs = projectActivityDefinitions.map(pad => pad.sysId);
        const isExistsInIdleTimeMetrics = projectADs.includes(api.state.selectedActivityID);
        api.setState("showIdleTimeMetricsConfirmation", isExistsInIdleTimeMetrics);
    }
    api.data.is_scope_analysis_stage_enabled.refresh();
}
