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
    const output = api.data.fetch_popular_and_frequently_browsed_items_1.output;
    api.setState("catalogItemsDisplayed", output.items);
    api.setState("hideCatalogItemsEmptyOrErrorState", output.items.length);
    api.setState("hideCatalogItemsLoadingState", true);
    api.setState("hideCatalogItemsContainer", !output.items.length);

    if (!output.items ?.length) {
        const header = await helpers.translate((output.type === "popular_items") ? "No popular requests yet" : "You haven’t requested anything yet");
        const body = await helpers.translate((output.type === "popular_items") ? "Popular requests appear when items are frequently requested across your company. Check back later to see what’s trending." : "Your recently requested items will appear here once you have placed a request. Meanwhile, you can browse the catalog to find what you need.");
        api.setState("catalogItemsEmptyOrErrorInfo", {
            message: {
                header,
                body,
            },
            icon: "no-data"
        });
    }

    // Memoize the results for quick links
    const categoriesInfoMap = api.state.categoriesInfoMap;
    categoriesInfoMap[output.type] = {
        items: output.items
    };
    api.setState("categoriesInfoMap", categoriesInfoMap);
}
