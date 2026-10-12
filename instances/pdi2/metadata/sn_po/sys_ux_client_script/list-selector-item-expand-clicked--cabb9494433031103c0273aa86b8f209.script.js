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
    const tableName = event.payload.item.reference;
    api.data.get_breakdown_fields.execute({
        tableName: tableName,
        currentTableName: 'promin_breakdown_field',
        entityId: '',
    });
    api.setState('listSelectorCurrentTable', tableName);
}
