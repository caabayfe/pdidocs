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
    helpers.modal.close('turn_off_native_translation');
    const eventName = event.name;
    const turnOffClicked = api.state.turnOffNTClicked;
    if (eventName === "CANVAS_MODAL#CLOSED" && !turnOffClicked) {
        api.setState('nativeTranslationValue', true);
    }
    api.setState('turnOffNTClicked', false);

}
