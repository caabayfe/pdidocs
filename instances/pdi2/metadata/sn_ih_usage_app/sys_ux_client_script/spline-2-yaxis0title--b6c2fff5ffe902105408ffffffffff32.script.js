/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.data_egress_trends_by_date.output.dataMetric || "Data Exported";
}
