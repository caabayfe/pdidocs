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
    // Object to map dropdown to key
    const keys = {
        "task_type_dropdown": "task.sys_class_name",
        "time_frame_dropdown": "task.opened_at"
    };

    const queryKey = keys[event.elementId];
    const queryValue = event.payload.item.id;

    // Building new param
    var newParam;
    if (queryValue !== "all") {
        if (queryKey === "task.sys_class_name") {
            newParam = `${queryKey}INSTANCEOF${queryValue}`;
        } else if (queryKey === "task.opened_at") {
            const timeFrame = event.payload.item.label;
            newParam = `${queryKey}ON${timeFrame}@javascript:gs.beginningOf${queryValue}()@javascript:gs.endOf${queryValue}()`;
        }
    }
    // Check if par filters are empty
    const areFiltersEmpty = !api.state.parFilters;

    // Exit if the filter is already applied
    if (newParam && !areFiltersEmpty && api.state.parFilters.includes(newParam)) {
        return;
    }

    // Remove existing filter for the same query key
    let query = areFiltersEmpty ? '' : api.state.parFilters
        .split("^")
        .filter(param => !param.includes(queryKey))
        .join("^");

    const newQuery = newParam ? (query==='' ? `${newParam}` : `${query}^${newParam}`) : query;

    api.setState("parFilters", newQuery);
    api.setState("listFilters", newQuery);
}
