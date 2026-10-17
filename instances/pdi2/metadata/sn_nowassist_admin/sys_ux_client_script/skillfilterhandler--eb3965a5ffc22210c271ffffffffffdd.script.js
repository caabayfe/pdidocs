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
    switch (event.name) {
        case "NOW_TYPEAHEAD#SELECTED_ITEM_SET":
            var filter = api.state.skillChangeHistoryFilter;
            switch (event.elementId) {
                case "product_filter":
                    filter.product = event.payload.item.id;
                    filter.productLabel = event.payload.item.label;
                    break;
                case "scope_filter":
                    filter.scope = event.payload.item.id;
                    filter.scopeLabel = event.payload.item.label;
                    break;
                case "model_provider_filter":
                    filter.modelProvider = event.payload.item.id;
                    filter.modelProviderLabel = event.payload.item.label;
                    break;
            }
            api.setState('skillChangeHistoryFilter', filter);
            break;
        case "NOW_BUTTON_BARE#CLICKED":
            switch (event.elementId) {
                case "clear_filter":
                    api.setState('skillChangeHistoryFilter', {});
                    api.setState('skillChangeFilterCount', 0);
                    api.setState('skillPageNumber', 0);
                    api.data.fetch_skill_provider_update_history_1.execute({
                        page_number: 0,
                        records_per_page: api.state.skillPageSize,
                        search_term: api.state.skillSearchTerm,
                        skill_change_filter: {}
                    });
                    break;
            }
            break;
        case "NOW_BUTTON#CLICKED":
            
            switch (event.elementId) {
                case "apply_filter":
                    api.setState('skillPageNumber', 0);
                    api.data.fetch_skill_provider_update_history_1.execute({
                        page_number: 0,
                        records_per_page: api.state.skillPageSize,
                        search_term: api.state.skillSearchTerm,
                        skill_change_filter: api.state.skillChangeHistoryFilter
                    });
                    api.setState('skillChangeFilterCount', getNumberOfKeys(api.state.skillChangeHistoryFilter));
                    break;
            }
            break;
    }

    function getNumberOfKeys(obj) {
        let count = 0;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                count++;
            }
        }
        return count/2;
    }
}
