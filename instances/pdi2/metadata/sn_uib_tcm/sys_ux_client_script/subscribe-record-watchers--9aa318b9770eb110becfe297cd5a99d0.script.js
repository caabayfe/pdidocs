/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const isTCMAvailable = api.data.is_task_communication_management_plugin_active.output;
    const props = api.context.props;
    if (isTCMAvailable) {
        api.setState("subscribeCommTaskWatcher", props.subscribeCommTaskWatcher || false);
        api.setState("subscribeCommPlanWatcher", props.subscribeCommPlanWatcher || false);
        api.setState("subscribeCommChannelWatcher", props.subscribeCommChannelWatcher || false);
    }
}
