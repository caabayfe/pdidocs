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
    let actionType = event.payload.action.actionIdentifier;
    if (actionType == 'CREATE_TEMPLATE') {
        helpers.navigate.to('de-duplication-template', {}, {
            "templateSysId": "new",
            "cb": Date.now()
        });

    } else if (actionType == 'CREATE_LIBRARY') {
        helpers.modal.open('create_new_library_modal', {'bare': true});
    }
}
