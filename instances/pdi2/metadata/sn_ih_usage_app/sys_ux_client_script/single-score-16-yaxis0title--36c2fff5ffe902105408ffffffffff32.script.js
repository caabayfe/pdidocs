/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
//Over Trend Y axis label
function evaluateProperty({api, helpers}) {
  return api.data.data_egress_overview_trends_1.output.dataMetric || "Data Exported";
}
