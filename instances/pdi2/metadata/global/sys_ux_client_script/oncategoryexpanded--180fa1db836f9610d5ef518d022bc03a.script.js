/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const expandedStateEvent = event.payload.value;
    const expandedStateEventSize = expandedStateEvent.length;
    if(expandedStateEventSize > 0){
        const categoriesInfoMap = api.state.categoriesInfoMap;
        const lastEvent = expandedStateEvent[expandedStateEventSize - 1];
        const potentialExpandedCategoryId = lastEvent[lastEvent.length - 1];
        const potentialExpandedCategory = categoriesInfoMap[potentialExpandedCategoryId];
        if (!potentialExpandedCategory.subcategoriesFetched) {
            potentialExpandedCategory.subcategoriesFetched = true;
            categoriesInfoMap[potentialExpandedCategoryId] = potentialExpandedCategory;
            api.setState("categoriesInfoMap", categoriesInfoMap);
            api.setState("expandedCategory", potentialExpandedCategory);
        }
    }
    api.setState("expandedState", expandedStateEvent);
}
