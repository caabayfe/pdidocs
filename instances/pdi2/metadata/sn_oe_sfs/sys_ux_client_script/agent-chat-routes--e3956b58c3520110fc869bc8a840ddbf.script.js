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
    const {
        eventName,
        eventPayload
    } = event.payload;

    switch (eventName) {
        case 'VIEW_SETTINGS_CHAT_HISTORY':
            navigateToRoute(api, 'conversation-history-settings', "", {
                aceNav: "agent-chat"
            });
            break;
        case 'VIEW_ALL_QUICK_ACTIONS':
            navigateToList(api, 'quickactions_workspace_action', {
                aceNav: "agent-chat"
            });
            break;
        case 'VIEW_PROFANITY_SETTINGS':
            navigateToRoute(api, 'profanity-settings', "", {
                aceNav: "agent-chat"
            });
            break;
    }

    function navigateToList(api, table, params) {
        navigateToRoute(api, 'list', {
            'table': table
        }, params);
    }

    function navigateToRoute(api, route, fields, params) {
        api.emit('NAV_ITEM_SELECTED', getNavPayload({
            route: route,
            fields: fields,
            params: params || {}
        }));
    }

    function getNavPayload({
        route,
        fields,
        params
    }) {
        if (!params) {
            params = {};
        }
        if (!params.t) {
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
