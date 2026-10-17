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
    try {
       
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#WRAPPED_CLICKED' &&
            event.payload.wrappedAction == 'CREATE_NEW_RECORD') {
            helpers.navigate.to('deflection-configuration', {
                'deflectionconfigurationId': -1,
            }, {"timestamp": Date.now()});
        }
    } catch (e) {

    }
}
