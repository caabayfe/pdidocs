/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var filteredTaskList = '';
    var multiSearch = '';
    var search = '';
    if (api.state.isUserAssociatedTab) {
        filteredTaskList = "userSelectedFilteredTasks";
        multiSearch = "userSelectedMultiSearch";
        search = api.state.userSelectedMultiSearch;
    } else {
        filteredTaskList = "matchingFilteredTasks";
        multiSearch = "matchingMultiSearch";
        search = api.state.matchingMultiSearch;
    }

    // if there is a new search set, let us overwrite the previous search set
    if(event.name == "NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET") {
        api.setState(multiSearch, event.payload.value);
        search = event.payload.value;
    }

    if (search && search.length > 0) {
        var taskIds = [];
        for (var i = 0; i < search.length; i++) {
            taskIds.push(search[i].id);
        }

        api.setState(filteredTaskList, taskIds);
        api.data.deduplication_template_filter_tasks.refresh();
    } else {
        api.setState(filteredTaskList, "");
    }
}
