/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const resources = api.elements.builder_core.resolvedContext.outputs.page;
  // filter out `app` and reassign the property val
  const { app, ...scriptResources } = resources.context;
  resources.context = scriptResources;
	return resources;
}
