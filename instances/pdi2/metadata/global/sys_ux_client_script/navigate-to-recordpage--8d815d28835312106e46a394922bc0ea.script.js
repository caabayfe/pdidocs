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
    helpers.navigate.to("table", {
        
        table: event.payload.cell.value,
        sysId: event.payload.cell.metadata.openRecordMetadata.sysId,
    });
}
