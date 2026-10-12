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
    
    const eventName = event.name;
    api.setState('DTValue', false);
    api.setState('showDTOnAlert', true);
    const turnOnClicked = api.state.turnOnDTClicked;
    if (eventName === "CANVAS_MODAL#CLOSED" && turnOnClicked) {
        api.setState('DTValue', true);
        api.setState('showDTOnAlert', true);
    }
    api.setState('turnOnDTClicked', false);
    helpers.modal.close('turn_on_dt');
}
