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
    const paginatedItems = api.state.rowDefinitions.rows.slice(event.payload.value * 5, (event.payload.value + 1) * 5);
    api.setState("paginatedItems", {
        rows: [...paginatedItems]
    });
}
