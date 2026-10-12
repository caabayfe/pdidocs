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
    const { sn_record_list_data_broker: {selectionProps: {allRowsSelected, selectedRowIds}, tableMetadata} } = api.data;
    
    const selectedRowSysIds = allRowsSelected
        ? tableMetadata.allSysIds.join(',')
        : selectedRowIds.join(',');

    const modalSize = allRowsSelected ? 'lg' : 'md';

    const cascadeFields = {
        'table': tableMetadata.table,
        'objSysId': selectedRowSysIds,
    };
    api.emit('LIST_CTRL#OPEN_MODAL', {
        route: 'cascade-delete',
        fields: {
            ...cascadeFields
        },
        size: modalSize,
        enableFullScreenInMobile: false,
    });
}
