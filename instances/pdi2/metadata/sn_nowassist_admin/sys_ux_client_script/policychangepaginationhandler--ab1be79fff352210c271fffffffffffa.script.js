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
    var eventName = event.name;
    switch (eventName) {
        case "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET":
            var pageSize = event.payload.value;
            api.setState('policyPageSize', pageSize);
            api.setState('policyPageNumber', 0);
            api.setState('policyPageSizeSet', true);

            api.data.fetch_policy_update_history_1.execute({
                page_number: 0,
                records_per_page: pageSize,
                search_term: api.state.policySearchTerm
            });
            break;
        case "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET":
        if(!api.state.policyPageSizeSet){
                var pageNumber = event.payload.value;
                api.setState('policyPageNumber', pageNumber);
                api.data.fetch_policy_update_history_1.execute({
                    page_number: pageNumber,
                    records_per_page: api.state.policyPageSize,
                    search_term: api.state.policySearchTerm
                });
        }
        api.setState('policyPageSizeSet', false);
            break;
    }
}
