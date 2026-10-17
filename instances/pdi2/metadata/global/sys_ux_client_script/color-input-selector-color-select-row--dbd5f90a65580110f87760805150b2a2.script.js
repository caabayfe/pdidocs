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
        payload
    } = api.context.props;
    api.emit('CI_UPDATE_COLOR_VALUE', {
        "key": payload.key,
        "value": event.payload.fieldValue
    });
}
