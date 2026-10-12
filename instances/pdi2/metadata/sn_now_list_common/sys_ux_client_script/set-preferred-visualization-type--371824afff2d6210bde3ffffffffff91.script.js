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
    var preferences = api.data.look_up_user_preferences_1.result.preferences;
    var preferredVizType = "vertical_bar";
        if (preferences[0].value != null) {
            preferredVizType = preferences[0].value;
        }    
    api.setState('visualizationType', preferredVizType);
}
