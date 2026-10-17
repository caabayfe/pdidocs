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

    var eventId = event.elementId;

    const {ModelVersioningUtil} = imports['sn_nowassist_admin.ModelVersioningUtil']();
        
    var updateFilter = function(filterKey, value) {
        var currentFilters = api.state.selectedFilters || {};
        var newFilters = Object.assign({}, currentFilters);
        newFilters[filterKey] = value;
        api.setState("selectedFilters", newFilters);
    };
    
    switch(eventId) {
        case "skill_search_input":
            var searchTerm = (event.payload && event.payload.searchTerm) || '';
            
            if (searchTerm === api.state.searchTerm) break;
        
            var searchFilteredData = ModelVersioningUtil.searchAndFilterData(api.state.allSkillsVersions,searchTerm,api.state.filters);
            api.setState("searchTerm", searchTerm);
            api.setState("filteredSkillsVersions", searchFilteredData);
            break;

        case "filter_btn":
            var currentFilters = api.state.filters || {};
            var safeFilters = {
                skills: currentFilters.skills || [],
                providers: currentFilters.providers || [],
                sourceModels: currentFilters.sourceModels || [],
                targetModels: currentFilters.targetModels || []
            };
            api.setState("selectedFilters", JSON.parse(JSON.stringify(safeFilters)));
            helpers.modal.open("filters_modal");
            break;

        case "skill_type_filter":
            updateFilter("skills", event.payload.value);
            break;


        case "provider_filter":
            updateFilter("providers", event.payload.value);
            break;
        
        case "current_model_filter":
            updateFilter("sourceModels", event.payload.value);
            break;

        case "target_model_filter":
            updateFilter("targetModels", event.payload.value);
            break;

        case "clear_filter_button":
            api.setState("selectedFilters", {});
            break;
            
        case "cancel_filter":
            helpers.modal.close("filters_modal");
            break;

        case "apply_filter":
            api.setState("filters", Object.assign({}, api.state.selectedFilters));
            var applyFilteredData = ModelVersioningUtil.searchAndFilterData(api.state.allSkillsVersions,api.state.searchTerm,api.state.selectedFilters);
            api.setState("filteredSkillsVersions", applyFilteredData);
            helpers.modal.close("filters_modal");
            break;

        case "skills_tab_pagination_control":
            var key = event.name === "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET" 
                ? "pageSize" 
                : "currentPage";
            var newPaginationControls = Object.assign({}, api.state.paginationControls);
            newPaginationControls[key] = event.payload.value;
            api.setState("paginationControls", newPaginationControls);
            break;
            
        default:
            break;
    }
}
