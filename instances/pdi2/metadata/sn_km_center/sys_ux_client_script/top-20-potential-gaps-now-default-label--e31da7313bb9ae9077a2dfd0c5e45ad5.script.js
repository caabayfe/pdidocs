/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Dynamic evaluation of number of gaps
  const data = api.state.chartData[0].data;
  const gapTaskCount = data ?  Object.keys(data).length : 0;
	return helpers.translateSync("Top {0} potential gaps", [gapTaskCount]);
}
