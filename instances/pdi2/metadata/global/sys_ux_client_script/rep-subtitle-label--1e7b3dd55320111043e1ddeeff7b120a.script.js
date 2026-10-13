/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var value = api.data.grab_last_lag.results[0].value.displayValue;
  if (value == null) {
    return "";
  } else {
    return "MetricBase Lag Statistics";
  }
}
