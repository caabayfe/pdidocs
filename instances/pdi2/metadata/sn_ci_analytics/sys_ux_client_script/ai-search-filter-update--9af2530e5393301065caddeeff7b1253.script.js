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

    if (event.name === 'UXF_TAB_SET#TAB_SELECTED' && event.payload.selectedTabIndex !== 0) 
        return; // don't refresh this widget when switching to other tabs

   
    const { encodeFilter } = imports["sn_ci_analytics.VADasboardUtils"](api);

    const filterBody = {
        from_date: startDate,
        to_date: endDate,
        query: filter,
        timestamp: Date.now(),
        type: "AI"
    };
    var encodedFilter = encodeFilter(filterBody);
    api.setState("aiSearchFilter", encodedFilter);
}
