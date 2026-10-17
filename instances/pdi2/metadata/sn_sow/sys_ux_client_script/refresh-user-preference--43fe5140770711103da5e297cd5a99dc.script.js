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
    if (api.data.check_user_access_token_availability.output) {
        var userPresenceStatus = api.data.fetch_ms_teams_user_presence.output.userPresenceStatus.mappedPresence;
        api.setState('userPresenceStatus', userPresenceStatus);
        var refreshDuration = parseInt(api.data.fetch_ms_teams_user_presence.output.refreshDuration);
        helpers.timing.setTimeout(function() {
            api.data.fetch_ms_teams_user_presence.refresh();
        }, (refreshDuration * 1000));
    }
}
