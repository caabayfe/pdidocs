/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const { table, sysId } = event.payload.cell?.metadata?.openRecordMetadata;
    let diffField = '';

    if(table === 'cmdb_multisource_data')
        diffField = event.payload.context?.row?.cells?.diff_field?.value;

    api.setState('diffField', diffField);
    api.setState('navigationPayload', {
        table,
        sysId
    });
}
