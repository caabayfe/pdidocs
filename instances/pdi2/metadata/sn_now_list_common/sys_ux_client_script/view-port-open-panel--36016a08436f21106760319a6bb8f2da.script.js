 /**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 */
 function handler({
    api,
    event,
    imports,
    helpers
}) {
    var defaultViewportId = 'list_panel_viewport';
    var params = {...event.payload.params}
    var payload = {route: event.payload.route, fields: {...event.payload.fields}, params};
    var viewportElementId = event.elementId.replace('list_controller', defaultViewportId);
    if (!viewportElementId.startsWith(defaultViewportId)){
        viewportElementId = defaultViewportId
    }

    if(params.viewportElementId != null) {
        viewportElementId = params.viewportElementId
    }
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {...payload, viewportElementId});
    api.setState('horizontalPanePosition', 'both');
    api.setState('verticalPanePosition', 'both');
    api.setState('sidePanelState', {
        isPanelOpened: true,
        panelCurrentRoute: event.payload.route
    });
}
