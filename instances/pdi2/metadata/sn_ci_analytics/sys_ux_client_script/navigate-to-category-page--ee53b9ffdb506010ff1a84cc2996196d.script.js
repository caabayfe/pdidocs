/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    var query = event.payload.params.query;
    var category = query.split('category=')[1];
    helpers.navigate.to('category', null, {
        startDate: api.context.props.startDate,
        endDate: api.context.props.endDate,
        selectedCategory: category
    });
}
