/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var val = api.data.get_total_series.results[0].value.displayValue;
    if (val == null) {
      val = 0;
    }
	return 'Total Series Count: ' + val;
}
