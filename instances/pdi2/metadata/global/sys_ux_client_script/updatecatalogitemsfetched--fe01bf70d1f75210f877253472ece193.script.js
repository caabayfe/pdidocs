/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({
    api,
    event,
    helpers,
    imports
}) {

    const handleEmptyState = async () => {
        const header = await helpers.translate("No results found");
        const body = await helpers.translate("Try adjusting your search term or browse the categories to find what you need.");
        const noSearchResultsHeading = await helpers.translate("No results for \"{0}\"", api.state.searchData.searchTerm);
        api.setState("catalogItemsEmptyOrErrorInfo", {
            message: {
                header,
                body
            },
            icon: "no-search-results",
        });
        api.setState("hideCatalogItemsContainer", true);
        api.setState("hideCatalogItemsLoadingState", true);
        api.setState("hideCatalogItemsEmptyOrErrorState", false);
        api.setState("catalogItemsContainerHeading", noSearchResultsHeading);
    };

    const output = api.data.browse_catalog_items_1.output;
    const componentReadyEventDispatched = api.state.componentReadyEventDispatched;
    let currCatalogItems;
    if (!output.isSearchResult) {   //Update catalog items data fetched at category level
        const category = output.category;
        const categoriesInfoMap = api.state.categoriesInfoMap;
        const categoryInfo = categoriesInfoMap[category];
        currCatalogItems = categoryInfo.items ?? [];
        currCatalogItems = [...currCatalogItems, ...output.items];
        categoryInfo.items = currCatalogItems;
        categoryInfo.queryPageIndex = output.queryPageIndex;
        categoryInfo.hasNext = output.hasNext;
        categoriesInfoMap[category] = categoryInfo;
        api.setState("categoriesInfoMap", categoriesInfoMap);
        if(!api.state.componentReadyEventDispatched){
            api.setState("componentReadyEventDispatched", true);
            api.emit("CATALOG_BROWSE#COMPONENT_READY");
        }
    } else {    //Update catalog items data fetched for search
        if (!output?.items?.length) {
            await handleEmptyState();
            return;
        } 
        const searchData = api.state.searchData;
        currCatalogItems = searchData.items ?? [];
        currCatalogItems = [...currCatalogItems, ...output.items];
        searchData.items = currCatalogItems;
        searchData.queryPageIndex = output.queryPageIndex;
        searchData.hasNext = output.hasNext;
        api.setState("searchData", searchData);
    }

    // Update state to display catalog items, hide loading, and show "load more" as needed
    let endWindow = api.state.currentLimit;
    let hideLoadMore = true;
    if (currCatalogItems.length < endWindow + 1)
        endWindow = currCatalogItems.length;
    else
        hideLoadMore = false;
    api.setState("hideLoadMore", hideLoadMore);
    api.setState("catalogItemsDisplayed", currCatalogItems.slice(0, endWindow));
    api.setState("hideCatalogItemsContainer", false);
    api.setState("hideCatalogItemsLoadingState", true);

    const pageLimit = api.state.pageLimit;
    // Focus on the catalog item when a category is selected or load more is clicked
    if (componentReadyEventDispatched && !output.isSearchResult) {
        helpers.timing.setTimeout(() => {
            api.emit("MACROPONENT_FOCUS_ELEMENT_REQUESTED", {
                elementId: api.state.layoutSelected == "grid" ? "grid_card_repeater" : "list_card_repeater",
                restParams: [Math.floor((endWindow - 1) / pageLimit) * pageLimit, api.state.layoutSelected == "grid" ? "grid_card_container" : "list_card_container"],
            });
        }, 20);
    }
}
