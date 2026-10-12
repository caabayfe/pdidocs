/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var source_type_api = ['JSON', 'REST', 'SOAP'];
  var egressTrendData = api.data.data_egress_trends_by_date.output.dataTrend;
  var apiTrendData = [];
  for (var i = 0; i < egressTrendData.length; i++) {
    if (source_type_api.indexOf(egressTrendData[i].metadata.dataSourceLabel) > -1) {
      apiTrendData.push(egressTrendData[i]);
    }
  }
	return apiTrendData;
}
