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
    api.setState('isLoading', false);
    let { last_refresh_message, next_refresh_message, is_realtime_load }  = api.data.get_important_actions_for_dashboard.output;
    api.setState('isRealTimeLoad', is_realtime_load);
    if(is_realtime_load){
        api.setState('statusText', last_refresh_message);
    } else {
        if (last_refresh_message !== '') {
            api.setState('statusText', last_refresh_message + ' | ' + next_refresh_message);
        } else {
            api.setState('statusText', next_refresh_message);
        }
    }
    api.setState('importantActions', api.data.get_important_actions_for_dashboard.output.cards_metadata);
    if(api.state.importantActionsLoaded === false){
        api.setState('importantActionsLoaded', true);
    }
}
