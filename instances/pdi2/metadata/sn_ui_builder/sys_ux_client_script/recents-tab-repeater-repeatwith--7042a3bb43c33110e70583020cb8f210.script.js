/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const searchTerm = (api.data.controller.searchTerm || '').toLowerCase();
	return api.data.controller.recentlyViewed.filter((result) => !searchTerm || result.label.toLowerCase().includes(searchTerm));
}
