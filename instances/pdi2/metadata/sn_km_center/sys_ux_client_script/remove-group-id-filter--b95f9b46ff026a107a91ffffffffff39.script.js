/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */

/**
 * Updates query after Unmark as group action is executed (removes group_id filter)
*/
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let query = api.state.listFilters
        .split("^")
        .filter(param => !param.startsWith("group_id"))
        .join("^");

    api.setState("listFilters", query);
}
