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
    const canLoggedInUserTriggerActions = api.data.get_loggedin_user_actions.output;
    const loggedInUserTriggerActions = {
        "canEndCall": canLoggedInUserTriggerActions.canEndCall,
        "canLeaveCall": canLoggedInUserTriggerActions.canLeaveCall,
        "canKickOthers": canLoggedInUserTriggerActions.canKickOthers,
        "canAddParticipants": canLoggedInUserTriggerActions.canAddParticipants,
        "canReinitiateCall": canLoggedInUserTriggerActions.canReinitiateCall,
        "canMute": canLoggedInUserTriggerActions.canMute,
        "canUnmute": canLoggedInUserTriggerActions.canUnmute,
        "canMultiMute": canLoggedInUserTriggerActions.canMultiMute
    };

    api.setState('loggedInUserTriggerActions', loggedInUserTriggerActions);
}
