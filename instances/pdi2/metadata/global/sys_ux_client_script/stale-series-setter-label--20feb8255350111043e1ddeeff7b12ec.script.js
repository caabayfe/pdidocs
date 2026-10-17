/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var val = parseFloat(api.data.get_stale_series.results[0].value.displayValue);
  var total = parseFloat(api.data.get_total_series.results[0].value.displayValue);
  var ratio;
  if (total == 0 || val == null || total == null) {
    ratio = 0;
  } else {
     ratio = Math.round((val/total * 100) * 100)/100;
  }
	return 'Stale Series Ratio: ' + ratio + "% of series are stale.";
}
