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
    api.setState('activitiesCount', event.payload.model.layoutQuery.allSysIds.length);
    const entityActivitiesList = event.payload.model.layoutQuery.queryRows;
    const entityActivities= [];
    for (const [key, value] of entityActivitiesList) {
        entityActivities.push(value.displayValue);
    }
    api.setState('entityActivities', entityActivities);
    api.data.get_process_configuration_for_activity.execute({
        table: api.state.selectedEntity.table.value
    });
}
