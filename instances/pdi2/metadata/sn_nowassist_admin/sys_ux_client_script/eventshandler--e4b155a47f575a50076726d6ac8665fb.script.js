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
    var skillCardData, skillListData;
    var allSkillData = api.state.allSkillData;
    var filter = {
        filterProviderVal: api.state.filterProviderVal,
        filterStateVal: api.state.filterStateVal,
        filterTypeVal: api.state.filterTypeVal,
        filterFeatureVal: api.state.filterFeatureVal
    };
    const {
        SkillOperationUtil
    } = imports['sn_nowassist_admin.SkillOperationUtil']();

    switch (event.elementId) {
        case 'list_button':
            api.setState('gridViewSelected', false);
            api.data.save_skill_listing_user_preference_1.execute({
                keyName: 'gridViewSelected',
                gridViewSelectedValue: false
            });
            break;

        case 'grid_button':
            api.setState('gridViewSelected', true);
            api.data.save_skill_listing_user_preference_1.execute({
                keyName: 'gridViewSelected',
                gridViewSelectedValue: true
            });
            break;

        case 'search_input_1':
            // Get the search term
            var searchTerm = event.payload.searchTerm;
            api.setState('searchTerm', searchTerm);
            // Apply search and existing filters
            var result = SkillOperationUtil.applySearchAndFilter(allSkillData, {
                searchTerm: searchTerm,
                filter: filter,
                sortBy: api.state.sortBy
            });
            // Update filter count
            updateFilterCount(filter);
            // Save skill data
            saveSkillData(result.skillCardData, result.skillListData);
            break;
        case 'feature_dropdown':
            // Apply existing search and filters
            var result = SkillOperationUtil.applySearchAndFilter(allSkillData, {
                searchTerm: api.state.searchTerm,
                filter: filter,
                sortBy: api.state.sortBy
            });
            // Save skill data
            saveSkillData(result.skillCardData, result.skillListData);
            break;
        case 'status_dropdown':
            // Apply existing search and filters
            var result = SkillOperationUtil.applySearchAndFilter(allSkillData, {
                searchTerm: api.state.searchTerm,
                filter: filter,
                sortBy: api.state.sortBy
            });
            // Save skill data
            saveSkillData(result.skillCardData, result.skillListData);
            break;
        case 'sortBy_dropdown':
            // apply sort on already applied filters
            var result = SkillOperationUtil.sortSkillData(
                {
                    skillCardData:api.state.skillCardData,
                    skillListData: api.state.skillListData
                },allSkillData,api.state.sortBy);
            //save skill data
            saveSkillData(result.skillCardData,result.skillListData);
            break;
        case 'apply_filter_button':
            // Apply existing search and filters
            var result = SkillOperationUtil.applySearchAndFilter(allSkillData, {
                searchTerm: api.state.searchTerm,
                filter: filter,
                sortBy: api.state.sortBy
            });
            // Update filter count
            updateFilterCount(filter);
            // Save skill data
            saveSkillData(result.skillCardData, result.skillListData);
            // Close filter modal
            helpers.modal.close('filter_modal');
            break;

        case 'refresh_button':
            // Get skill data again - Apply filters and search already - update parameters
            api.data.get_skill_data_for_product_1.execute({
                "product_id": api.context.props.productId
            });
            break;

        case 'clear_filter_button':
            // Clear filter values
            clearAllFilters();
            // Apply search to all Data if any
            var result = SkillOperationUtil.applySearchAndFilter(allSkillData, {
                searchTerm: api.state.searchTerm,
                filter: {
                    ...filter,
                    filterTypeVal:[],
                    filterProviderVal:[]
                    },
                sortBy: api.state.sortBy
            });
            // Close filter modal
            helpers.modal.close('filter_modal');
            // Save filter Count
            api.setState('filterCount', 0);
            // Save skill Data
            saveSkillData(result.skillCardData, result.skillListData);
            break;

        case 'pagination_control_card':
            //paginate
            var skillCardPaginatedData = SkillOperationUtil.paginateSkill(api.state.skillCardData, event.payload.value, api.state.cardItemsPerPage);
            api.setState('skillCardPaginatedData', skillCardPaginatedData);
            api.setState("paginationObject", {
                ...api.state.paginationObject,
                "card": {
                    ...api.state.paginationObject["card"],
                    currPage: event.payload.value
                }
            });
            break;

        case 'pagination_control_list':
            //paginate
            var skillListPaginatedData = SkillOperationUtil.paginateSkill(api.state.skillListData, event.payload.value, api.state.listItemsPerPage);
            api.setState('skillListPaginatedData', skillListPaginatedData);
            var isEnabledRowDefinitions = { ...allSkillData.presentationListRowPayload,
                rows: skillListPaginatedData
            };
            api.setState('isEnabledRowDefinitions', isEnabledRowDefinitions);
            api.setState("paginationObject", {
                ...api.state.paginationObject,
                "list": {
                    ...api.state.paginationObject["list"],
                    currPage: event.payload.value
                }
            });
            break;
        case "gemini_websearch_alert":
            api.setState("showGeminiWebSearchBanner",false);
            break;
        default:
            break;
    }

    function saveSkillData(skillCardData, skillListData) {
        api.setState('skillCardData', skillCardData);
        api.setState('skillListData', skillListData);
        var {
            skillCardPaginatedData,
            skillListPaginatedData
        } = SkillOperationUtil.setInitialPaginationSkill(skillCardData, skillListData, 0, api.state.cardItemsPerPage, api.state.listItemsPerPage);
        api.setState('skillCardPaginatedData', skillCardPaginatedData);
        api.setState('skillListPaginatedData', skillListPaginatedData);
        api.setState("paginationObject", {
                ...api.state.paginationObject,
                "card": {
                    ...api.state.paginationObject["card"],
                    currPage: 0
                },
                "list": {
                    ...api.state.paginationObject["list"],
                    currPage: 0
                }
            });
        var isEnabledRowDefinitions = { ...api.state.allSkillData.presentationListRowPayload,
            rows: skillListPaginatedData
        };
        api.setState('isEnabledRowDefinitions', isEnabledRowDefinitions);
    }

    function clearAllFilters() {
        api.setState('filterProviderVal', []);
        api.setState('filterTypeVal', []);
    }

    function updateFilterCount(filter) {
        var filterCount = [filter.filterProviderVal, filter.filterTypeVal].reduce((count, arr) => count + (arr.length > 0 ? 1 : 0), 0);
        api.setState('filterCount', filterCount);
    }
}
