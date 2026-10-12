/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const catalogBrowseUtil = imports["global.CatalogBrowseUtil"]();
    const newSubcategoryData = api.data.load_sub_categories_on_demand___for_catalog_browse_1.output;
    if (!newSubcategoryData?.id)
        return;
    const categoriesListSource = api.state.categoriesListSource;
    const expandedCategoryReference = catalogBrowseUtil.findCategoryById(categoriesListSource, newSubcategoryData.id);

    if (expandedCategoryReference) {
        // Update client content tree data and the source list of all categories data: categoriesListSource
        Object.assign(expandedCategoryReference, newSubcategoryData);
        api.setState("categoriesListSource", categoriesListSource);
        const selectedCatalog = api.state.selectedCatalog;
        if (selectedCatalog?.id && selectedCatalog.id !== "all") {
            const contentTreeData = categoriesListSource.filter(category => category.catalog == selectedCatalog.id);
            api.setState("contentTreeData", contentTreeData);
        }
        else
            api.setState("contentTreeData", [...categoriesListSource]);
        
        // Update the source map of all categories data: categoriesInfoMap
        const categoriesInfoMap = api.state.categoriesInfoMap;
        api.setState("categoriesInfoMap", catalogBrowseUtil.updateCategoriesInfoMap(newSubcategoryData.children, categoriesInfoMap) );
    }
}
