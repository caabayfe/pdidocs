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
    const {
        buildSuccessNotificationItems
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);

    const message = await helpers.translate("Successfully updated Tags");
    const items = buildSuccessNotificationItems({
        content: message,
        id: "manage-tags-success-message"
    });
    
    api.emit('EXPLORE_CI_SHOW_NOTIFICATIONS', {
        items
    });

    helpers.timing.setTimeout(() => {
        api.emit('EXPLORE_CI_MAIN_CONTENT#REMOVE_NOTIFICATIONS', {
            items
        });
    }, 5 * 1000);
}
