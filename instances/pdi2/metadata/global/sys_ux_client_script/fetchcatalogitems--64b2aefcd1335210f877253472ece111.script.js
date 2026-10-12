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
    let {
        currentLimit,
        selectedCategory,
        pageLimit,
        searchData
    } = api.state;

    const handleCategorySelected = (payload) => {
        selectedCategory = payload.item;
        currentLimit = pageLimit;
        searchData = {};
        api.setState("searchData", searchData);
        api.setState("searchInputText", '');
        api.setState("hideCatalogItemsContainer", true);
        api.setState("categorySelectedState", selectedCategory.path);
        api.setState("selectedCategory", selectedCategory);
        api.setState("catalogItemsContainerHeading", selectedCategory.label);
    };

    const handleSearchExecuted = async (currentSearchData) => {
        searchData = currentSearchData;
        currentLimit = pageLimit;
        const searchResultsHeading = await helpers.translate("Results for \"{0}\"", searchData.searchTerm);
        api.setState("searchData", searchData);
        api.setState("hideCatalogItemsContainer", true);
        api.setState("categorySelectedState", []);
        api.setState("catalogItemsContainerHeading", searchResultsHeading);
    };

    const handleLoadMoreClicked = () => {
        currentLimit = currentLimit + pageLimit;
    };

    const storeLastSearchData = (lastSearchData) => {
        if(lastSearchData.searchTerm){
            const searchStack = api.state.searchStack;
            searchStack.push(lastSearchData.searchTerm);
            api.setState("searchStack", searchStack);
        }
    };

    switch (event.name) {
        case "NOW_CONTENT_TREE#ITEM_CLICKED":
            handleCategorySelected(event.payload);
            api.setState("showLeftPanelMobile", !api.state.showLeftPanelMobile);
            break;
        case "NOW_INPUT#ENTER_KEYDOWN":
            if (!event ?.payload ?.fieldValue.trim())
                return;
            storeLastSearchData(api.state.searchData);
            api.setState("searchInputText", event.payload.fieldValue);
            searchData = {
                searchTerm: event.payload.fieldValue
            };
            await handleSearchExecuted(searchData);
            break;
        case "NOW_BUTTON#CLICKED":
            if (event.elementId === "load_more") {
                handleLoadMoreClicked();
            }
            break;
        case "NOW_BUTTON_ICONIC#CLICKED":
            if(event.elementId === "post_search_back_button"){
                const searchStack = api.state.searchStack;
                if(searchStack.length){
                    const searchTerm = searchStack.pop();
                    api.setState("searchInputText", searchTerm);
                    await handleSearchExecuted({searchTerm: searchTerm});
                    api.setState("searchStack", searchStack);
                }
                else
                    handleCategorySelected({item: api.state.selectedCategory});
            }
            else if ((event.elementId === "search_button_1" || event.elementId === "search_button_2") && api.state.searchInputText.trim()){
                storeLastSearchData(api.state.searchData);
                searchData = {
                    searchTerm: api.state.searchInputText
                };
                await handleSearchExecuted(searchData);
            }
            break;
        default:
            break;
    }

    api.setState("hideCatalogItemsEmptyOrErrorState", true);
    api.setState("hideLoadMore", true);
    api.setState("hideCatalogItemsLoadingState", false);
    api.setState("currentLimit", currentLimit);

    const onloadData = api.data.validate_catalog_browse_properties_1.output;
    //Load existing data to display catalog items depending on if its search activity or a category is selected
    const isSearchActivity = !!searchData?.searchTerm ?? false;
    const categories = isSearchActivity ? (onloadData.sourceType == 'category' ? onloadData.sourceIdList : '') : selectedCategory?.id;
    const catalogs = (isSearchActivity && onloadData.sourceType != 'category') ? onloadData.sourceIdList : '';
    const source = isSearchActivity ? searchData : api.state.categoriesInfoMap[categories] || {};
    const catalogItems = source?.items || [];
    const queryPageIndex = source ?.queryPageIndex ?? 0;
    const hasNext = source ?.hasNext ?? true;

    //Check if catalog items data exist else fetch from data broker
    if (catalogItems.length > currentLimit || !hasNext) {
        const endWindow = catalogItems.length > currentLimit ? currentLimit : catalogItems.length;
        api.setState("catalogItemsDisplayed", catalogItems.slice(0, endWindow));
        api.setState("hideLoadMore", !(catalogItems.length > currentLimit || hasNext));
        api.setState("hideCatalogItemsLoadingState", true);
        api.setState("hideCatalogItemsContainer", false);

        // Focus on the catalog item when a category is selected or load more is clicked
        if (!isSearchActivity) {
            helpers.timing.setTimeout(() => {
                api.emit("MACROPONENT_FOCUS_ELEMENT_REQUESTED", {
                    elementId: api.state.layoutSelected == "grid" ? "grid_card_repeater" : "list_card_repeater",
                    restParams: [Math.floor((endWindow - 1) / pageLimit) * pageLimit, api.state.layoutSelected == "grid" ? "grid_card_container" : "list_card_container"],
                });
            }, 20);
        }
    } else {
        api.setState("fetchCatItemsQueryInput", {
            categories,
            catalogs,
            searchTerm: searchData.searchTerm,
            itemCountRequired: currentLimit - catalogItems.length,
            queryPageIndex,
            queryBatchSize: api.state.queryBatchSize,
        });
    }
}
