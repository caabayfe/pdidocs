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
    const userData = api.data.look_up_user_preferences.result;
    if (userData && userData.preferences) {
        const preferences = userData.preferences;
        let overviewUserPreferencesObj = {
            ...api.state.overviewUserPreferences
        };
        for (let index in preferences) {
            if (preferences[index].name === 'sow.layout.overview_pane' && preferences[index].value != null) {
                overviewUserPreferencesObj.selectedPane = preferences[index].value;
            } else if (preferences[index].name === 'sow.layout.overview_ratio.incident' && preferences[index].value != null) {
                overviewUserPreferencesObj.overviewDividerPosition = preferences[index].value;
            }
        }
        api.setState('overviewUserPreferences', overviewUserPreferencesObj);
    }
}
