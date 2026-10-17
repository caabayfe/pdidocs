async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    let searchQuery = "",
        filterQuery = "all";
    if (event.elementId === "search_input" && event.name === "NOW_INPUT#INPUT") {
        searchQuery = event.payload.fieldValue;
        filterQuery = api.state.filterQuery;
        api.setState("searchQuery", searchQuery);
    } else if (event.elementId === "filter_menu" && event.name === "NOW_DROPDOWN#SELECTED_ITEMS_SET") {
        filterQuery = event.payload.value[0];
        searchQuery = api.state.searchQuery;
        api.setState("filterQuery", filterQuery);
    }
    if (event.elementId === "clear_search_query" && event.name === "NOW_BUTTON_ICONIC#CLICKED") {
        searchQuery = "";
        filterQuery = api.state.filterQuery;
        api.setState("searchQuery", searchQuery);
    }
    if (searchQuery === "" && filterQuery === "all") {
        api.setState("isSearchingAndFiltering", false);
        api.setState("showSearchAndFilterEmptyState", false);
        return;
    }
    await notifyConfUtils.searchAndFilterCallCards(searchQuery, filterQuery, api, helpers);
}
