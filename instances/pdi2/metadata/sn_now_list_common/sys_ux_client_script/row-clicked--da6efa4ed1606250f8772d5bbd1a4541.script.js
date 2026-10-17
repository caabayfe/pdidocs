/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event
}) {
    const {
        context: { row } = {},
    } = event.payload;

    if (!row?.key) return;
    const { enableCardClickOpen } = api.data?.sn_record_list_data_broker?.out ?? {};
    if(!enableCardClickOpen) return;

    api.emit('LIST_CTRL#CONTEXT_ACTION_CLICKED', {
        context: {
            row
        },
        actionItem: {
            id: 'sn-list-gallery-open-record',
            action: 'OPEN_RECORD_CLICKED'
        }
    });
    
}
