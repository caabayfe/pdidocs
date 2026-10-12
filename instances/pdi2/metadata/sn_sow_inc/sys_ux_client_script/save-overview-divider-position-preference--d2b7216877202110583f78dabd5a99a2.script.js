/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     if (event.payload.interaction === "USER_ACTION") {
        const overviewDividerPosition = event.payload.dividerPosition;
        let overviewUserPreferencesObj = {
            ...api.state.overviewUserPreferences
        };
        overviewUserPreferencesObj.overviewDividerPosition = overviewDividerPosition;
        api.setState('overviewUserPreferences', overviewUserPreferencesObj);
        api.data.save_user_preference.execute({
            'name': 'sow.layout.overview_ratio.incident',
            'value': overviewDividerPosition
        });
     }
}
