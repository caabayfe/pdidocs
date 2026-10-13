/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    let { startDate, endDate } = event.payload;
    let topicName = api.context.props.topicName;

    var params = {
        startDate: startDate,
        endDate: endDate,
        topicName: topicName
    };
    helpers.navigate.setRouteParams({
        params
    });

}
