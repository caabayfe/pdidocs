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
    helpers.translate('All caught up').then((allCaughtUp) => {
        api.setState('allCaughtUp', allCaughtUp);
        api.setState('custom_table_flag_text', allCaughtUp);
        api.setState('custom_app_flag_text', allCaughtUp);
    });
    helpers.translate('Needs attention').then((needsAttention) => {
        api.setState('needsAttention', needsAttention);
    });
}
