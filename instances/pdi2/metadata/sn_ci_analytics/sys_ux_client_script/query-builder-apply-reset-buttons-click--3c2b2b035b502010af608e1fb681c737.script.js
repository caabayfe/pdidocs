/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api,event,helpers,imports}) {
    const { encodeFilter } = imports["sn_ci_analytics.VADasboardUtils"]();
    const query = event.payload.query;
    const { pageSize, sortBy } = api.state;
    const filterBody = { 
        query,
        page_num: 1,
        page_size: pageSize
    };
    let encodedFilter = encodeFilter(filterBody);
    if (sortBy)
        encodedFilter += "^ORDERBY" + sortBy;
    api.setState("userListFilter", encodedFilter);
    api.setState("queryBuilderValue", query);
}
