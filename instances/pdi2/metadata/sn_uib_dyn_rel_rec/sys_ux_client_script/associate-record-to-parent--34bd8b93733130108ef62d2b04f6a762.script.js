/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    api.emit("RELATED_RECORD_ASSOCIATE_RECORD", {
        table: event.payload.table,
        sysId: event.payload.sysId
    });
}
