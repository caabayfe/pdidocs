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
    const raFullSearchViewHelper = imports['sn_nb_action.RAFullSearchViewHelper'](...arguments);
    raFullSearchViewHelper.handleSearchEvents();
}
