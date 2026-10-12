/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { component } = api.elements.component_builder_settings ?? {};
	return component?.macroponent?.sysScope?.displayValue
}
