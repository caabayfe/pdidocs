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
if (api.data.fetch_channel_config_data.output.isTokenAvailable && !api.data.fetch_collaboration_section_data.output.hasChats) {
    var refreshDuration = parseInt(api.data.fetch_channel_config_data.output.refreshDuration);
    helpers.timing.setTimeout(function() {
        api.setState('latestRecommendedUsers', [...api.state.recommendedUsers]);
    }, (refreshDuration * 1000));
}

}
