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
    const {
        startDate: from_date,
        endDate: to_date,
        selectedCategories: category
    } = api.context.props;
    const {
        encodeFilter
    } = imports['sn_ci_analytics.VADasboardUtils']();
    const filter = {
        from_date,
        to_date,
        category,
        sub_category: 'STANDARD'
    };
    let encodedFilter = encodeFilter(filter);
    if (event.name === 'MACROPONENT_READY')
        encodedFilter += "^ORDERBYDESCinitiated";
    api.setState('topicListFilter', encodedFilter);
}
