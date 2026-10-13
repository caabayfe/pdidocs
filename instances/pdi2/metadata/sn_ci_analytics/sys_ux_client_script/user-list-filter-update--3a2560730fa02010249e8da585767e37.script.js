/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api,event,helpers,imports}) {
    const MACROPONENT_PROPERTY_CHANGED = 'MACROPONENT_PROPERTY_CHANGED';

    const { encodeFilter, handlePaginationEvent } = imports["sn_ci_analytics.VADasboardUtils"](api);
    const { queryBuilderValue } = api.state;
    let { pageNumber, pageSize, sortBy } = api.state;

    const paginationHandlerOutput = handlePaginationEvent(event, pageNumber, pageSize);
    pageNumber = paginationHandlerOutput.pageNumber;
    pageSize = paginationHandlerOutput.pageSize;

    if (event.name === MACROPONENT_PROPERTY_CHANGED) {
        pageNumber = 1;
        api.setState('pageNumber', pageNumber);
    }

    const filterBody = {
        query: queryBuilderValue,
        page_num: pageNumber,
        page_size: pageSize,
        timestamp: Date.now()
    };
    let encodedFilter = encodeFilter(filterBody);
    if (event.name === "NOW_DROPDOWN#SELECTED_ITEMS_SET" && event.elementId === "sort_dropdown") {
        sortBy = event.payload.value;
        api.setState('sortBy',sortBy);
    }
    if (sortBy) 
        encodedFilter += "^ORDERBY" + sortBy;
    api.setState("userListFilter", encodedFilter);
}
