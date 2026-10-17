/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var success = event.payload.data.output.data.snOeSfs.sidebarAdminConsole.submitTeamsConfiguration.success;
    var message = event.payload.data.output.data.snOeSfs.sidebarAdminConsole.submitTeamsConfiguration.message;
    var errorType = event.payload.data.output.data.snOeSfs.sidebarAdminConsole.submitTeamsConfiguration.errorType;

    if(api.state.setupStatus != "incomplete" || !api.state.isTeamsConfigured) {
        api.setState("readOnly", false);
    }

    if(success){
        navigateToRoute(api, 'side-bar');
    } else if(errorType == "error"){
        displayError(api, message);
    } else if (errorType == "crossScopeMessage") {
        displayWarning(api, message);
    }

    function displayError(api, message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'sev-1',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: {
                    type: 'html',
                    value: '<span>' + message + '</span>'
                },
                action: {type: 'dismiss'}
            }]
        });
    }

    function displayWarning(api, message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'ac_scope_alert',
                status: 'warning',
                icon: 'circle-info-outline',
                content: {
                    type: 'html',
                    value: '<span>' + message + '</span>'
                },
                action: {type: 'dismiss'}
            }]
        });
    }
    

    function navigateToRoute(api, route, fields, params) {
        api.emit('NAV_ITEM_SELECTED', getNavPayload({
                route: route,
                fields: fields,
                params: params || {}
        }));
    }

    function getNavPayload({ route, fields, params }) {
        if(!params) {
            params = {};
        }
        if(!params.t) {
            params.t = Date.now();
        }

        return {
            route: route,
            fields: fields,
            params: params,
            redirect: true,
            passiveNavigation: false,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: null,
            reload: true
        };
    }
}
