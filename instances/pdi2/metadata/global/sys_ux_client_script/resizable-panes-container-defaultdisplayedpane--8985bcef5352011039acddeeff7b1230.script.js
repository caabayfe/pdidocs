/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const viewports = api.viewports;
  
  if (!viewports || !viewports.isRouteInitializationCompleted)
    return 'both';
  
  // hide the right side panel if there are no active routes.
  return viewports.contextual_sidebar.hasRoutes ? 'both' : 'left';
}
