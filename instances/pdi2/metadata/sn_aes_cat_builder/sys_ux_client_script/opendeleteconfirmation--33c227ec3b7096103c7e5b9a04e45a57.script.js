/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        modal
    } = helpers;
    const {
        targetRecord,
        isNewRecord
    } = event.payload || {};
    api.setState('catalogItemToDelete', targetRecord);
    api.setState('isNewRecord', isNewRecord);
    modal.open("[component-id$='confirm_delete']");
}
