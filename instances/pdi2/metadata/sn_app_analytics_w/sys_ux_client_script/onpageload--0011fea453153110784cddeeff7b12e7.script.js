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
}
