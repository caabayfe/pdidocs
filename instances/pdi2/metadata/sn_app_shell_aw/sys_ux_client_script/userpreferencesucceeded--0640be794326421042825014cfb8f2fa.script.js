/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 */
function script({ api, event }) {
    const { elementId, name } = event;
    if (elementId === "save_user_preference_1" && name === "DATA_OP_SUCCEEDED")
        api.data.look_up_user_preferences_1.result;
    else if (elementId === "look_up_user_preferences_1" && name === "DATA_FETCH_SUCCEEDED") {
        const preferences = api.data.look_up_user_preferences_1.result.preferences;
        if (Array.isArray(preferences) && preferences.length > 0) {
            const appId = api.context.app.appId ? api.context.app.appId : api.context.props.appId;
            const item = preferences.find(item => {
                return item.name === `workspace.preferences.${appId}`;
            });
            if (!item) {
                api.setState('dividerPosition', api.state.resizePaneConfig?.defaultDividerPosition);
            } else {
                if (typeof item?.value === 'string') {
                    const newPref = JSON.parse(item.value);
                    if (typeof newPref.dividerPosition === 'number') {
                        api.setState('savedDividerPosition', newPref.dividerPosition);

                        const { hoistedContentConfiguration } = api.elements.wsLayout;

                        const utilityPanelVisible = hoistedContentConfiguration
                            && hoistedContentConfiguration.hasHoistedContent
                            && !!hoistedContentConfiguration.activeHoistedContent
                            && !hoistedContentConfiguration.isHidden;

                        if (utilityPanelVisible)
                            api.setState('dividerPosition', newPref.dividerPosition);
                    }

                }
            }
        }
    }
}
