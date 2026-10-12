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
    api.setState("hideCatalogItemsLoadingState", false);
    api.setState("hideCatalogItemsEmptyOrErrorState", true);
    api.setState("hideCatalogItemsContainer", true);
    api.setState("hideLoadMore", true);
    api.setState("expandedState", []);
    const categoriesListSource = api.state.categoriesListSource;
    const selectedCatalog = event.payload.item;
    api.setState("selectedCatalog", selectedCatalog);
    const filteredList = (selectedCatalog.id == "all" || !(selectedCatalog?.id)) ? categoriesListSource : categoriesListSource.filter(category => category.catalog === selectedCatalog.id);
    api.setState("contentTreeData", filteredList);
    api.setState("selectedCategory", filteredList[0]);
    api.setState("categorySelectedState", filteredList[0].path);
    api.setState("catalogItemsContainerHeading", filteredList[0].label);
    api.setState("searchData", {});
    api.setState("currentLimit", api.state.pageLimit);

    const category = filteredList[0].id;
    const categoryInfo = api.state.categoriesInfoMap?.[category];
    const catalogItems = categoryInfo.items ?? [];
    const queryPageIndex = categoryInfo.queryPageIndex ?? 0;

    //Check if catalog items data exist else fetch from data broker
    if (catalogItems.length > pageLimit) {
        api.setState("catalogItemsDisplayed", catalogItems.slice(0, pageLimit));
        api.setState("disableNextPage", false);
        api.setState("hideCatalogItemsLoadingState", true);
        api.setState("hideCatalogItemsContainer", false);
    } else {
        api.setState("fetchCatItemsQueryInput", {
            categories: category,
            itemCountRequired: api.state.pageLimit - catalogItems.length,
            queryPageIndex,
            queryBatchSize: api.state.queryBatchSize,
        });
    }
}
