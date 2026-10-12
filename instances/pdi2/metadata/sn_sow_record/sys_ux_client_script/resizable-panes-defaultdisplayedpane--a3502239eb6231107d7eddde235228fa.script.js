/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const viewports = api.viewports;

    if (!viewports || !viewports.isRouteInitializationCompleted)
        return 'both';

    // hide the right side panel if there are no active routes.
    return viewports.viewport_gph.hasRoutes ? 'both' : 'left';
}
