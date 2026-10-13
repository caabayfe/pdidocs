/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    let { startDate, endDate } = event.payload;
    let spokeName = api.context.props.spokeName;

    var params = {
        startDate: startDate,
        endDate: endDate,
        spokeName: spokeName
    };
    helpers.navigate.setRouteParams({
        params
    });

}
