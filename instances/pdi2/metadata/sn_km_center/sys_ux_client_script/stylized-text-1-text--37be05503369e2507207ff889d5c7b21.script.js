/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.isGenAiGenerating || api.state.isSearchLoading) {
    return helpers.translateSync('Drafting article...');
  }
	return helpers.translateSync('Use AI to draft this article?');
}
