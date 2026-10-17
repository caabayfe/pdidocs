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
    const interactionSysId = api.state.interactionSysId;
    const chatRecordSysId = (api.data.get_record_sysid_1.output && api.data.get_record_sysid_1.output.sysId);
    if (chatRecordSysId)
        api.emit('NAV_ITEM_SELECTED', {
            route: "ms-teams-import",
            fields: {
                table: 'interaction',
                sysId: interactionSysId
            },
            params: {
                chatRecordSysId
            },
            targetRoute: 'current'
        });
    else
        helpers.navigate.to('record', {
            'table': 'interaction',
            'sysId': interactionSysId
        }, {}, false, false, 'current');
}
