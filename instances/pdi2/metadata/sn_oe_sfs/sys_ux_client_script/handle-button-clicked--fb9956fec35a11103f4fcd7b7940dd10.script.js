/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var elementId = event.elementId;

    if(elementId == 'button_1')
        navigateToRoute(api, 'sidebar-microsoft-teams-setup','',{'aceNav': "side-bar"});

    if(elementId == 'dropdown_1') {
        var item = event.payload.item.id;
        if(item == 'view_settings')
            navigateToRoute(api, 'sidebar-microsoft-teams-setup','',{'aceNav': "side-bar"});

        if(item == 'view_permissions')
            navigateToRoute(api, 'sidebar-teams-permission','', {'aceNav': "side-bar"});
        
        // 'remove' is handled in the parent page - Sidebar
    }

    if(elementId == 'slack_button')
        navigateToRoute(api, 'sidebar-slack-integration','', {'aceNav': "side-bar"});

    if (elementId == 'dropdown_2') {
        var item = event.payload.item.id;
        if (item == 'view_settings')
          navigateToRoute(api, 'sidebar-slack-integration','', {'aceNav': "side-bar"});
    }

    function navigateToRoute(api, route, fields, params) {
        api.emit('NAV_ITEM_SELECTED', getNavPayload(
            api,
            {
                route: route,
                fields: fields,
                params: params || {}
            }
        ));
    }

    function getNavPayload(api, { route, fields, params }) {
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
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: null,
            reload: true

        };
    }
}
