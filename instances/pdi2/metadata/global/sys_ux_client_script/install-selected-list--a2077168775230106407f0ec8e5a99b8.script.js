/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var selectedList = api.state.selectedListGroup;
    if (selectedList == 'undefined' || selectedList.length == 0) {
        return;
    }

    api.setState('hideLoader', false);
    api.setState('progressState', 'calling');
    var groupId = selectedList.substring(selectedList.length - 1);
    api.data.set_password_exclusion_group.execute({ "groupId": groupId });
}
