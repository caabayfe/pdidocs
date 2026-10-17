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
    api.setState('kpiCategoryList', [, {
        "id": "bookmarked",
        "label": await helpers.translate("Bookmarked")
    }, {
        "id": "created_by_me",
        "label": await helpers.translate("created_by_me_lowercase")
    }, {
        "id": "all",
        "label": await helpers.translate("All")
    }]);

    if (api && 
        api.context &&
        api.context.app && 
        api.context.app.appId == "08c73d60537101100834ddeeff7b1287") {

        api.emit("NAV_ITEM_SELECTED", {
            route: "pages",
            params: {
                filter: null,
                library: "overview"
            }
        });
    }
}
