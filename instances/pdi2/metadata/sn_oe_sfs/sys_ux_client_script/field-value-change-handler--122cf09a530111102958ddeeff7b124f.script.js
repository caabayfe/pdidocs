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
    const payload = event.payload;
    let modifiedFields = api.state.modifiedFields;
    modifiedFields[payload.fieldName] = payload.value;
    api.setState('modifiedFields', modifiedFields);
}
