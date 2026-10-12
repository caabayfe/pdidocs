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
            table: api.context.props.table,
            sysId: api.context.props.sysId
        };
        const params = {};
        if (event.context.item && event.context.item.value && event.context.item.value.chatSysId)
            params.chatRecordSysId = event.context.item.value.chatSysId;
        api.emit('NAV_ITEM_SELECTED', {
            route: "ms-teams-import",
            title: await helpers.translate("Import Teams Chat"),
            fields,
            params,
            targetRoute: 'current' // to open as sub-tab
        });
    } else return {};
}
