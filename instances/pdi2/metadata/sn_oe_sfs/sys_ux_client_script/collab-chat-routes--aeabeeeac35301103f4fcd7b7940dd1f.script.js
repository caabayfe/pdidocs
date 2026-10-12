/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { eventName, eventPayload } = event.payload;

    switch(eventName) {
        case 'VIEW_SYS_CS_COLLAB_USER_QUERY':
            navigateToList(api, 'sys_cs_collab_user_query',{'aceNav': "side-bar"});
            break; 
        case 'VIEW_SYS_CS_COLLAB_ENABLED_TABLES':
            navigateToList(api, 'sys_cs_collab_enabled_table',{'aceNav': "side-bar"});
            break; 
        case 'VIEW_SYS_CS_COLLAB_CHAT_REQUESTER':
            navigateToList(api, 'sys_cs_collab_chat_requester',{'aceNav': "side-bar"});
            break; 
    }
    
    function navigateToList(api, table, params) {
        navigateToRoute(api, 'list', { 'table': table }, params);
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
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: null
        };
    }
}
