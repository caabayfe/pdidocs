/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const searchTerm = (api.state.recentsSearchTerm || '').toLowerCase();
	return api.state.recentlyUpdated.filter((result) => !searchTerm || result.label.toLowerCase().includes(searchTerm));
}
