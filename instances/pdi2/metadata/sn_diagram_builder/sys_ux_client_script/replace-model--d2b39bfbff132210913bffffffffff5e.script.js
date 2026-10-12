/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
api.emit("SN_DB_DIAGRAM#REPLACE_MODEL",{
    diagramJSON: JSON.parse(event.payload.value)
});
}
