/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var txt = "Data last updated at: " + api.data.get_utilization_stats.results[0].sys_updated_on.displayValue;
  var zone = new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1];
	return txt + " " + zone;
}
