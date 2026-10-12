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
            value,
        },
    } = event;

    const updatedSetup = {
        ...nlu_settings,
    };

    if (value) {
        updatedSetup[elementId].value = "";
        api.setState('nlu_settings', updatedSetup);
    }


}
