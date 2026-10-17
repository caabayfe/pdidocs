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
    const recordTable = api.state.recordTable;
    const recordSysId = api.state.recordSysId;
    if (recordTable === 'kb_knowledge') {
        openRecord('kb_view', recordTable, recordSysId);
    } else {
        openRecord('record', recordTable, recordSysId);
    }

    function openRecord(navigator, table, sysId) {
        const actionData = {
            actionName: 'OPEN_RECORD',
            actionPayload: {
                table: table,
                sysId: sysId
            }
        };
        api.emit('LOG_SEARCH_RESULT_EVENT', {
            actionData: actionData
        });
        helpers.navigate.to(navigator, {
            'table': table,
            'sysId': sysId
        }, {}, false, false, 'current');
    }

}
