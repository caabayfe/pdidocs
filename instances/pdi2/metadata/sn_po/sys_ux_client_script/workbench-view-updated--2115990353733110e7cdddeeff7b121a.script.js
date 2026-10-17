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
    const {
        views
    } = event.payload;

    api.setState('compare_mode_on', Boolean(views.right));
    api.setState('current_view', views);
}
