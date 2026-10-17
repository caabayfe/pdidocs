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
    const {
        selectedEntity,
        processId,
        showIdleTimeMetricsConfirmation,
        activitiesListSelectedRecords,
        projectIdleTimeEnabled
    } = api.state;

    if (showIdleTimeMetricsConfirmation && projectIdleTimeEnabled) {
        const params = {
            value: false,
            entityId: selectedEntity._row_data.uniqueValue,
            processId: processId,
            fields: ""
        };
        api.data.include_idle_time_for_project.execute({
            payload: params
        });
        api.setState("showIdleTimeMetricsConfirmation", false);
    }

    api.data.delete_activities.execute({
        table: 'promin_activity_def',
        query: 'sys_idIN' + activitiesListSelectedRecords.join(','),
    });
}
