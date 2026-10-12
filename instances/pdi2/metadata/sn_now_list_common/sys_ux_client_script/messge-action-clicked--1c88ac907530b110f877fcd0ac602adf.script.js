/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 */
function handler({
    api,
    event
}) {
    const {
        action
    } = event.payload;
    if (action === 'TOGGLE_SELECT_ALL_ROWS') {
        api.emit('LIST_CTRL#TOGGLE_SELECT_ALL_ROWS');
    }
    if (action === 'TOGGLE_SELECT_ALL_ROWS_ON_PAGE') {
        api.emit('LIST_CTRL#TOGGLE_SELECT_ALL_ROWS_ON_PAGE');
    }
     if (action === 'RESET_ROW_SELECTION_ACTION') {
        api.data.sn_record_list_data_broker.resetRowSelection();
    }
}
