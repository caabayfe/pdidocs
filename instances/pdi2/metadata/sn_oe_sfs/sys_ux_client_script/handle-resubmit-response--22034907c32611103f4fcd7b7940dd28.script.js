/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("readOnly", false);
    try {
        var success = event.payload.data.output.data.snOeSfs.sidebarAdminConsole.resubmitTeamsConfiguration.success;
        var message = event.payload.data.output.data.snOeSfs.sidebarAdminConsole.resubmitTeamsConfiguration.message;

        if(success){
            navigateToRoute(api, 'side-bar');
        } else {
            displayError(api, message);
        }
    } catch(error) {
        message = api.data.translations.output.sidebar_unknown_error || "We’ve run into an issue. Please contact technical support for details.";
         displayError(api, message);
         console.error("Error: " + error.toString());
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
