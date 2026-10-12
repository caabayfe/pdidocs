
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
    let encodedQuery = "";
    let queryUpdated = false;
    const DELIMITER = "^";
    let encodedQueryArray = [];
    const mergePARFiltersV2 = imports["global.mergePARFilters"]().v2;
    const appliedFilters = api.context.props.filterConfigurations;
    const table = api.context.props.table;
    
    if (event?.payload?.name === "groupByField" || event?.name === 'ADDITIONAL_GROUP_BY_ITEM_SELECTED') {
        if (event?.name === 'ADDITIONAL_GROUP_BY_ITEM_SELECTED' && event?.payload?.id != '') {
            if (event?.payload?.id != 'none') {
                encodedQueryArray.push('GROUPBY' + event?.payload?.id);
                api.setState("additionalGroupBy", event?.payload?.id);
            }
            else {
                encodedQueryArray = [];
                api.setState("additionalGroupBy", '');
            }
        } else if (api?.context?.props?.groupByField && api?.context?.props?.groupByField != '') {
            encodedQueryArray.push('GROUPBY' + api?.context?.props?.groupByField);
        }
        if (api?.state?.listQueryCombinedWithParFilter && api?.state?.listQueryCombinedWithParFilter != '') {
            encodedQueryArray.push(api.state.listQueryCombinedWithParFilter);
        } else if (api?.state?.listFilterQuery && api?.state?.listFilterQuery != '') {
            encodedQueryArray.push(api.state.listFilterQuery);
        }
        encodedQuery = encodedQueryArray.join(DELIMITER);
        api.setState("encodedQuery", encodedQuery);
    }

    if (event?.payload?.dataElemId === "proccessparfilter_1" || event?.payload?.name === "filterConfigurations") {
        //if filterConfigurations is present get the encodedQueries
        const {
        encodedQueries
    } = mergePARFiltersV2(
        [], 
        appliedFilters
    );
        var parFilter = api?.data?.proccessparfilter_1?.output;
        //if encodedQueries Object has a encodedQuery with our table use that else use parFilter
        parFilter = (encodedQueries && Object.hasOwn(encodedQueries,table)) ? encodedQueries[table] : parFilter;
        var listFilterQuery = api?.state?.listFilterQuery;
        if (!parFilter) {
            if (!listFilterQuery) {
                api.setState("listQueryCombinedWithParFilter", '');
            } else {
                api.setState("listQueryCombinedWithParFilter", listFilterQuery);
                encodedQueryArray.push(listFilterQuery);
            }
        } else {
            if (!listFilterQuery) {
                api.setState("listQueryCombinedWithParFilter", parFilter);
                encodedQueryArray.push(parFilter);
            } else {
                const conditionSetSeparator = '^NQ';
                const conditionSets = listFilterQuery.split(conditionSetSeparator);
                const updatedConditionSet = conditionSets.map(
                    ( /** @type {string} */ conditionSet) =>
                    `${conditionSet}^${parFilter}`
                );
                var finalQuery = updatedConditionSet.length === 1 ? updatedConditionSet.join() :
                    updatedConditionSet.join(conditionSetSeparator);
                api.setState("listQueryCombinedWithParFilter", finalQuery);
                encodedQueryArray.push(finalQuery);
            }
        }
        if (api?.state?.additionalGroupBy && api?.state?.additionalGroupBy != '') {
            encodedQueryArray.push('GROUPBY' + api?.state?.additionalGroupBy);
        } else if (api?.context?.props?.groupByField && api?.context?.props?.groupByField != '') {
            encodedQueryArray.push('GROUPBY' + api?.context?.props?.groupByField);
        }
        encodedQuery = encodedQueryArray.join(DELIMITER);
        api.setState("encodedQuery", encodedQuery);
    }
}
