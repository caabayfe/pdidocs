/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	try {
    var val = parseFloat(api.data.get_utilization_stats.results[0].value.displayValue);
    var ratio;
    if (val == 0 || val == null) {
      ratio = 0;
    } else {
      ratio = Math.round((val * 100) * 100)/100;
    }
    return 'Data Utilization Efficency: ' + ratio + "%";
  } catch (e) {
    return 'Data Utilization Efficency: ' + 0 + "%";
  }
}
