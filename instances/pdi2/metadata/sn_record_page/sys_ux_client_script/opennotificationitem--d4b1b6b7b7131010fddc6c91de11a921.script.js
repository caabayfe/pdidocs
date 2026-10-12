function handler({
                     api,
                     helpers,
                     event,
                     imports
                 }) {
    const {
        routeMapping,
        buildDefaultRoutePayload
    } = imports["global.recordRoutesMapping"]();

    /**
     * "NOTIFICATION_ITEM_CLICKED" event payload status tells what action
     * needs to be executed.
     *
     * - status === 'read'
     *   Handle in the client script to correctly map to NAV_ITEM_SELECTED
     *
     * - status === 'deleted'
     *   No event mapping required as the canvas notification tray component
     *   takes care to manage the deletion of the notification item
     *
     */
    const {status} = event.payload;
    if (status === 'read') {
        const route = 'record',
            targetRoute = '',
            defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event),
            routeMap = api.data.dynamic_routing_workspace_notification.routeMap,
            payload = routeMapping(routeMap, defaultRoutePayload, event);

        api.emit('NAV_ITEM_SELECTED', payload);
    }

}
