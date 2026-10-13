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
    const DEFAULT_FILTER = '^ORDERBYDESCexecuted_count';
    const filter = {
        from_date,
        to_date,
        category,
        sub_category: 'TOPIC_BLOCK'
    };
    let encodedFilter = encodeFilter(filter);
    if (event.name === 'MACROPONENT_READY')
        encodedFilter += DEFAULT_FILTER;
    const localeValues = api.data.analytics_locale_get_list_1.output;
    api.setState('hideChart', true);
    api.setState('parentTopicDonutTitle', localeValues && localeValues['topicDonutLabel'] || '');
    api.setState('topicBlockListFilter', encodedFilter);
}
