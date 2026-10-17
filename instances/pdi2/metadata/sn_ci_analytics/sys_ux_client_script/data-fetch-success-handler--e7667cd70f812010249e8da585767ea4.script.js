/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    imports
}) {
    const layoutQuery = event.payload.model.layoutQuery;
    const firstRecordId = layoutQuery.allSysIds[0] || '';
    if (firstRecordId) {
        const {
            startDate: from_date,
            endDate: to_date,
            selectedCategories: category
        } = api.context.props;
        const topicBlock = layoutQuery.queryRows.get(firstRecordId).rowData.get('topic_block').columnData.value;
        const {
            encodeFilter
        } = imports['sn_ci_analytics.VADasboardUtils']();
        const filter = {
            from_date,
            to_date,
            category,
            topic_block: topicBlock,
            sub_category: 'TOPIC_BLOCK'
        };
        const filterObj = [{
            'order': 1,
            'type': 'query',
            'apply_to': ['sn_ci_analytics_st_topic_execution_stats'],
            'encoded_query': encodeFilter(filter)
        }];
        api.setState('parFilters', filterObj);
        api.setState('parentTopicDonutTitle', api.data.analytics_locale_get_list_1.output['topicDonutLabel'] + ' (' + topicBlock + ')');
        api.setState('hideChart', false);
        api.setState('selectedRecord', [firstRecordId]);
    }


}
