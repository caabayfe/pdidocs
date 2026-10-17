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
    helpers.modal.close('turn_off_dt');
    const eventName = event.name;
    const turnOffClicked = api.state.turnOffDTClicked;
    if (eventName === "CANVAS_MODAL#CLOSED" && !turnOffClicked) {
        api.setState('DTValue', true);
        api.setState('showDTOnAlert', true);
    }
    api.setState('turnOffDTClicked', false);

}
