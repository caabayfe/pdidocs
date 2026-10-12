/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 */
function script({ api, event }) {
    const appId = api.context.app.appId ? api.context.app.appId : api.context.props.appId;
    const interaction = event.payload.interaction;
    if (interaction !== "USER_ACTION" || !appId) return;

    const toBeSavedUserPref = {
        dividerPosition: api.state.resizePaneConfig.defaultDividerPosition
    }
    const newDividerPosition = event.payload.dividerPosition || 0;
    toBeSavedUserPref.dividerPosition = newDividerPosition;
    api.data.save_user_preference_1.execute({ name: `workspace.preferences.${appId}`, value: JSON.stringify(toBeSavedUserPref) });
    api.setState('savedDividerPosition', newDividerPosition);
}
