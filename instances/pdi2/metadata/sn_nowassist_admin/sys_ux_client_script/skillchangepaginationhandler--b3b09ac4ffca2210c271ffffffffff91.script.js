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
            api.setState('skillPageSize', pageSize);
            api.setState('skillPageNumber', 0);
            api.setState('skillPageSizeSet', true);
            api.data.fetch_skill_provider_update_history_1.execute({
                page_number: 0,
                records_per_page: pageSize,
                search_term: api.state.skillSearchTerm,
                skill_change_filter: api.state.skillChangeHistoryFilter
            });
            break;
        case "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET":
        if(!api.state.skillPageSizeSet){
                var pageNumber = event.payload.value;
                api.setState('skillPageNumber', pageNumber);
                api.data.fetch_skill_provider_update_history_1.execute({
                    page_number: pageNumber,
                    records_per_page: api.state.skillPageSize,
                    search_term: api.state.skillSearchTerm,
                    skill_change_filter: api.state.skillChangeHistoryFilter
                });
        }
        api.setState('skillPageSizeSet', false);
            break;
    }
}
