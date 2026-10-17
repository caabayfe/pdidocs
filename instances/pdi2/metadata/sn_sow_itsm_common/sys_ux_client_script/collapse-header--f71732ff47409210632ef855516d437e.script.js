/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const userData = api.data.look_up_user_preferences.result;
    if (userData && userData.preferences) {
        const preferences = userData.preferences;
        for (let index in preferences) {
            if (preferences[index].name === 'sow.incident.landing_page_header_collapsed' && preferences[index].value === 'true') {
                api.setState('isHeaderHidden', true);
                return;
            }
        }
    }
}
