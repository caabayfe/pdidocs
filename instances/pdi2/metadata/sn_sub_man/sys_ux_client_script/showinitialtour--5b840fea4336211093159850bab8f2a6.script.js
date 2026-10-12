/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const tourData = api.data.look_up_user_preferences.result;
    let showTour = true;

    if (tourData && tourData.preferences) {
        const preferences = tourData.preferences;
        for (let index in preferences) {
            if (preferences[index].name === 'sm.onboarding_modal.landing_page_hide_tour' && preferences[index].value === 'true') {
                showTour = false;
            }
        }
    }

    if (showTour) {
        api.emit('SN_HELP#GUIDANCE_START_REQUESTED', {"guidanceId": api.state.guidanceId});

        api.data.save_user_preference.execute({
            "name": "sm.onboarding_modal.landing_page_hide_tour",
            "value": true
        });
    }
}
