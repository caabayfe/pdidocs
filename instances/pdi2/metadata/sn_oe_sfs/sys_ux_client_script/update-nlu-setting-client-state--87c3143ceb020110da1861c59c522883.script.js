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
        nlu_settings
    } = api.state;
    const {
        elementId,
        payload: {
            value
        }
    } = event;

    const displayValue = (event.payload.item) ? event.payload.item.label : event.payload.value;

    const updatedSetup = {
        ...nlu_settings,
        [elementId]: {
            ...nlu_settings[elementId],
            value,
            displayValue
        }
    };

    api.setState('nlu_settings', updatedSetup);
}
