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
    if(event.name == "MACROPONENT_READY")
        api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS');
    const collapseAll = await helpers.translate("Collapse all");
    api.setState("upcomingLabel", collapseAll);
    api.setState("overDueLabel", collapseAll);
    api.setState("activeLabel", collapseAll);
}
