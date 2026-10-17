/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    let { startDate, endDate } = event.payload;
    let selectedCategory = api.context.props.selectedCategory;

    var params = {
        startDate: startDate,
        endDate: endDate,
        selectedCategory: selectedCategory
    };
    helpers.navigate.setRouteParams({
        params
    });

}
