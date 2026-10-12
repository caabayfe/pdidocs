/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        api.emit('NAV_ITEM_SELECTED', {
             route: 'multiple-active-conversation',
             reload: true,
             params: {
               t: Date.now()
            }
        });
    } catch (e) {

    }
}
