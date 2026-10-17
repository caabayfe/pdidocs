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
        value,
        fieldValue
    } = event.payload;
    const {
        inputInvalid
    } = api.state;
    if (fieldValue !== null && inputInvalid !== value) {
        api.setState({
            inputInvalid: value,
        });
    }
}
