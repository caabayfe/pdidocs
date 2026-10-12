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
    const catalogBrowseUtil = imports["global.CatalogBrowseUtil"]();
    const translatedMessages = {
        "layoutText": await helpers.translate('Display')
    };
    const onloadData = api.data.validate_catalog_browse_properties_1.output;
    const catalogsDetailList = onloadData.catalogs;

    api.setState("translatedMessages", translatedMessages);
    api.setState("catalogsDetailList", catalogsDetailList);
    api.setState("selectedCatalog", catalogsDetailList.length > 0 ? catalogsDetailList[0] : {} );
    api.setState("hideLoadingState", true);
    api.setState("hideEmptyState", onloadData.hideEmptyState);
    api.setState("hideComponent", !onloadData.hideEmptyState);

    const categoriesListSource = onloadData.categoriesTree;
    api.setState("categoriesListSource", categoriesListSource);
    api.setState("contentTreeData", categoriesListSource);
    api.setState("currentLimit", api.state.pageLimit);

    if (categoriesListSource.length) {
        api.setState("categoriesInfoMap", catalogBrowseUtil.updateCategoriesInfoMap(categoriesListSource, {}));
        api.setState("selectedCategory", categoriesListSource[0]);
        api.setState("categorySelectedState", categoriesListSource[0].path);
        api.setState("catalogItemsContainerHeading", categoriesListSource[0].label);
        api.setState("fetchCatItemsQueryInput", {
            categories: categoriesListSource[0].id,
            itemCountRequired: api.state.pageLimit,
            queryPageIndex: 0,
            queryBatchSize: api.state.queryBatchSize,
        });
    }
    else{
        api.setState("componentReadyEventDispatched", true);
        api.emit("CATALOG_BROWSE#COMPONENT_READY");
        api.emit("CATALOG_BROWSE#COMPONENT_EMPTY");
    }
}
