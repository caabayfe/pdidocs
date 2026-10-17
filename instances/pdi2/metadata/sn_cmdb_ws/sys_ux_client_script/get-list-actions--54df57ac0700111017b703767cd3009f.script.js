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
    if (api.context.props.queryState) {
        switch (api.context.props.queryState) {
            case 'PAUSED':
                api.setState('list_actions_record', api.state._listActionsRecordQBSearchPaused);
                break;
            case 'COMPLETE':
            case 'PROCESSING':
                api.setState('list_actions_record', api.state._listActionsRecordQBSearchComplete);
                break;
            default:
                // TODO: this is for status in FAILED, CANCELLED, MAX_LIMIT, READY, TIME_OUT
                // Handle errors and max limit in follow on story
        }
        api.setState('listRefresh', {
            timestamp: new Date()
        });
    } else {
        // If no query state prop, set to the default action config
        api.setState('list_actions_record', 'aa116c28b7a11110b87e80408e11a928');
    }
}
