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
    const {
        fieldName,
        value
    } = event.payload;
    const variablePath = fieldName.split('.');
    const variableName = variablePath.length && variablePath[variablePath.length - 1];
    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'SN_NS_ADMIN_INPUT_VALUE_CHANGED',
        eventPayload: {
            variableName,
            variableValue: value
        }
    });
}
