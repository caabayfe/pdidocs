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
    api.setState('time_range_start', api.context.props.rangestart);
    api.setState('time_range_end', api.context.props.rangeend);
}
