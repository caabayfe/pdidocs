/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	try {
    var val = parseFloat(api.data.get_gap.results[0].value.displayValue);
    val = Math.round(val);
    return 'Average Unutilized Data Gap: ' + val + " entries";
  } catch (e) {
    return 'Average Unutilized Data Gap: ' + 0 + " entries";
  }
}
