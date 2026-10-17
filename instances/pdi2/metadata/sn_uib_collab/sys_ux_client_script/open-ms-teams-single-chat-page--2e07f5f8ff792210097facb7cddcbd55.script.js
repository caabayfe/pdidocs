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
    if (event.payload.item.id == "import-teams-chat") {
        const fields = {
            table: event.context.item.value.chatSource.table,
            sysId: event.context.item.value.chatSource.sysId
        };
        const params = {};
        if (event.context.item && event.context.item.value && event.context.item.value.chatSysId)
            fields.chatRecordSysId = event.context.item.value.chatSysId;
        api.emit('NAV_ITEM_SELECTED', {
            route: "ms-teams-import-single-chat",
            title: await helpers.translate("View Teams Chat"),
            fields,
            params,
            targetRoute: 'current' // to open as sub-tab
        });
    } else return {};
}
