/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        errorNotificationItems,
        duplicateSysId
    } = event.payload;

    if(duplicateSysId) {
        api.setState('duplicateCISysId', duplicateSysId);
        helpers.modal.open("duplicate_ci_exists_modal");
    } else {
        api.emit('EXPLORE_CI_SHOW_NOTIFICATIONS', {
            items: errorNotificationItems
        });
    }
}
