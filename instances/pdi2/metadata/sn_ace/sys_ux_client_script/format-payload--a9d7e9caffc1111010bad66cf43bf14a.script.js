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
        analyticsChartPayload
    } = imports["sn_ace.FormatAnalyticsPayload"]();
    api.setState('payload', analyticsChartPayload(api.context.props.payload));
}
