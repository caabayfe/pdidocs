/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

api.emit('SN_HELP_PANEL#SHOW_REQUESTED', {

        appContext: {
            type: 'custom',
            page: 'home',
            app_route: 'now/conversation/settings',
        }
    });
}
