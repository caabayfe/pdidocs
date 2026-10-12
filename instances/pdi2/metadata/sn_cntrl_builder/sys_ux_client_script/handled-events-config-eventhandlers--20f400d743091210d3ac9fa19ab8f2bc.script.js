/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const filteredHandlers = api.elements.builder_core.filteredEventHandlers || [];
	return filteredHandlers?.flatMap((templateCategory) => {
		return templateCategory?.targets || [];
	});
}
