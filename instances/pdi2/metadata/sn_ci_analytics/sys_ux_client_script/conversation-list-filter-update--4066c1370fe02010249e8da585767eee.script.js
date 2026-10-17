/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api,event,helpers,imports}) {
    const { startDate, endDate, filter, encodedQuery } = api.context.props;
    
    //exit if there is encoded query for page load
    if(encodedQuery && event.name == "MACROPONENT_READY") return;
    
    let { pageNumber, pageSize, sortBy } = api.state;
    const { encodeFilter, handlePaginationEvent } = imports["sn_ci_analytics.VADasboardUtils"](api);

    // sort by changed
    if (event.name === "NOW_DROPDOWN#SELECTED_ITEMS_SET" && event.elementId === "sort_dropdown") {
        pageNumber = 1; // reset page number
        sortBy = event.payload.value;
        api.setState('sortBy',sortBy);
    }

    // MACROPONENT_PROPERTY_CHANGED - reset page number, if properties changed (query or dates)
    if (event.name === "MACROPONENT_PROPERTY_CHANGED")
        pageNumber = 1;
    
    // handle pagination
    const paginationHandlerOutput = handlePaginationEvent(event, pageNumber, pageSize);
    pageNumber = paginationHandlerOutput.pageNumber;
    pageSize = paginationHandlerOutput.pageSize;
    
    const filterBody = {
        from_date: startDate,
        to_date: endDate,
        query: filter,
        page_num: pageNumber,
        page_size: pageSize,
        timestamp: Date.now()
    };
    var encodedFilter = encodeFilter(filterBody);
    
    if (sortBy) 
        encodedFilter += "^ORDERBY" + sortBy;
        
    api.setState('conversationListFilter', encodedFilter);
    api.setState('pageNumber', pageNumber);
    api.setState('conversationId', '');
    
}
