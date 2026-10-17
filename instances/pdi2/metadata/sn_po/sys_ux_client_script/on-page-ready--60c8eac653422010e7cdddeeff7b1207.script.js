/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState('initial_filter_set', {
        "dataFilter": "",
        "breakdowns": [],
        "advancedXesFilters": [
            []
        ],
        "linkedProcessFilter": api.context.props.linkedModelId
    });
}
