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
    const listProps = api.data.sn_record_list_data_broker.out;
    api.emit('LIST_CTRL#OPEN_PANEL', {
        route: 'data-visualization',
        fields: {
            groupBy: event.payload.field,
            table: listProps.table,
            query: listProps.query,
            columns: listProps.columnDefinitions.columns
                .filter(column => column.columnHeaderActions && 
                    column.columnHeaderActions.some(action => action.id === 'show_visualization_clicked'))
                .map(column => ({
                    id: column.key,
                    label: column.label
                }))
        }
    });
}
