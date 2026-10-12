/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return '<p><span style="font-size: 24pt; text-transform: capitalize;">' + api.state.metricToCalculate + '</span><span style="font-size: 24pt;"> for individual CIs </span><span style="font-size: 14pt;">(matching filter condition above)</span></p>';
}
