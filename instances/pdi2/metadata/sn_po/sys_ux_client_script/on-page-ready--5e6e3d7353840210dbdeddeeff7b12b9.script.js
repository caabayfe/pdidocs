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
    let findingId = api.context.props.findingId;
    if (findingId)
        api.setState("initial_view", {
            "left": {
                "filters": {
                    "finding": findingId
                },
                "fixedFilters": {
                    "finding": findingId
                }
            },
            "right": null
        });
    api.data.fetch_promin_header_state_1.refresh();
}
