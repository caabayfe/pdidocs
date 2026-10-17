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
    } = api.state;

    if (event.payload.value) {
        const params = {
            value: event.payload.value,
            entityId: selectedEntity._row_data.uniqueValue,
            processId: processId,
            fields: ""
        };

        api.data.include_idle_time_for_project.execute({
            payload: params
        });
    }

}
