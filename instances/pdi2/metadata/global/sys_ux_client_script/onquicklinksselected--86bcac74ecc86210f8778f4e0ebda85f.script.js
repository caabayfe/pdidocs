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
    const quickLinkType = event.payload.item.id;
    api.setState("selectedCategory", event.payload.item);
    api.setState("categorySelectedState", [quickLinkType]);
    api.setState("hideCatalogItemsEmptyOrErrorState", true);
    api.setState("hideCatalogItemsContainer", true);
    api.setState("hideLoadMore", true);
    api.setState("hideCatalogItemsLoadingState", false);
    api.setState("catalogItemsContainerHeading", event.payload.item.label);

    const categoriesInfoMap = api.state.categoriesInfoMap;
    if(categoriesInfoMap[quickLinkType]?.items){
        if(!categoriesInfoMap[quickLinkType].items.length){
            const header = await helpers.translate((quickLinkType === "popular_items") ? "No popular requests yet" : "You haven’t requested anything yet");
            const body = await helpers.translate((quickLinkType === "popular_items") ? "Popular requests appear when items are frequently requested across your company. Check back later to see what’s trending." : "Your recently requested items will appear here once you have placed a request. Meanwhile, you can browse the catalog to find what you need.");
            api.setState("catalogItemsEmptyOrErrorInfo", {
                message: {
                    header,
                    body,
                },
                icon: "no-data"
            });
        }
        api.setState("catalogItemsDisplayed", categoriesInfoMap[quickLinkType].items);
        api.setState("hideCatalogItemsEmptyOrErrorState", categoriesInfoMap[quickLinkType].items.length);
        api.setState("hideCatalogItemsLoadingState", true);
        api.setState("hideCatalogItemsContainer", !categoriesInfoMap[quickLinkType].items.length);
    }
    else {
        api.setState("quickLinkType", quickLinkType);
        const onloadData = api.data.validate_catalog_browse_properties_1.output;
        if(api.state.sourceType != onloadData.sourceType){
            api.setState("sourceType", onloadData.sourceType);
            api.setState("sourceIdList", onloadData.sourceIdList);
        }
    }
    api.setState("showLeftPanelMobile", !api.state.showLeftPanelMobile);
}
