/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const articleCount = api.state.articleCount;
	const message =  helpers.translateSync("There are currently {0} articles flagged for optimization. The articles with the most issues are below.", articleCount);
  return message;
}
