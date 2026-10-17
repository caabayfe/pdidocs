
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
    var finalQueryList = [];
    var listFilter = api?.data?.report_source_query_combiner_1?.output;
    var parFilter  = api?.data?.proccessparfilter_1?.output;
    var groupBy = api?.context?.props?.groupByField;
    var listQueryCombinedWithParFilter = '';
    const mergePARFiltersV2 = imports["global.mergePARFilters"]().v2;
    const appliedFilters = api.context.props.filterConfigurations;
    const table = api.context.props.table;
    //if filterConfigurations is present get the encodedQueries
    const {
        encodedQueries
    } = mergePARFiltersV2(
        [], 
        appliedFilters
    );
    //if encodedQueries Object has a encodedQuery with our table use that else use parFilter
    parFilter = (encodedQueries && Object.hasOwn(encodedQueries,table)) ? encodedQueries[table] : parFilter;
    if (groupBy && groupBy != '') {
        finalQueryList.push('GROUPBY'+groupBy);
    }
     if (listFilter && listFilter != '') {
        if (api.context.props.parFilter && api.context.props.parFilter !== "") {
            const conditionSetSeparator = '^NQ';
            const conditionSets = listFilter.split(conditionSetSeparator);
            const updatedConditionSet = conditionSets.map(
                ( /** @type {string} */ conditionSet) =>
                `${conditionSet}^${parFilter}`
            );
            var finalQuery = updatedConditionSet.length === 1 ? updatedConditionSet.join() :
                updatedConditionSet.join(conditionSetSeparator);
            finalQueryList.push(finalQuery);
            listQueryCombinedWithParFilter = finalQuery;
        } else {
            finalQueryList.push(listFilter);
            listQueryCombinedWithParFilter = listFilter;
        }
    } else if (api.context.props.parFilter && api.context.props.parFilter !== "") {
        finalQueryList.push(parFilter);
        listQueryCombinedWithParFilter = parFilter;
    }
    api.setState('listTable', api?.context?.props?.dataSources?.[0]?.tableOrViewName);
    api.setState('listFilterQuery', listFilter);
    api.setState('listQueryCombinedWithParFilter', listQueryCombinedWithParFilter);
    api.setState('encodedQuery', finalQueryList.join('^'));
}
