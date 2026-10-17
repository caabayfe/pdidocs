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
    let isMute = event.context.item.value.muted;
    let actions = api.state.allowedActions;
    let result = [];
    for (let i = 0; i < actions.length; i++) {
        if (isMute) {
            if (actions[i].id != "mute")
                result.push(actions[i]);
        } else {
            if (actions[i].id != "unmute")
                result.push(actions[i]);
        }
    }
    api.setState("actionsToDisplay", result);
}
