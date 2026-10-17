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
    let isAppseeAvailable = api.data.appsee_availablity_1.output;
    if (!isAppseeAvailable && api.context.app.ace_application_id == '68724d24436b111061d09a549cb8f249') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: "/now/conversation/settings/overview",
                target: '_self'
            }
        });
    }
}
