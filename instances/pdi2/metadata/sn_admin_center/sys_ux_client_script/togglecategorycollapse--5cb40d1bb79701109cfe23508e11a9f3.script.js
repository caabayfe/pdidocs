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
    if (!api.state.categoryCollapseStatus)
        return;
    let collapseStatus = JSON.parse(api.state.categoryCollapseStatus);
    collapseStatus[event.context.item.value.maturity] = !collapseStatus[event.context.item.value.maturity];
    api.setState('categoryCollapseStatus', JSON.stringify(collapseStatus));
}
