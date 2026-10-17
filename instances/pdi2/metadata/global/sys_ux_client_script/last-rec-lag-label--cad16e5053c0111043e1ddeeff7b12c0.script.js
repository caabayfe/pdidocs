/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var value = api.data.grab_last_lag.results[0].value.displayValue;
  if (value == null) {
    return "";
  }
  var val = parseFloat(value);
  if (isNaN(val)) {
    val = 0;
  }
  var seconds = val / 1000;
  var minutes = Math.floor(seconds / 60);
  var txt;
	if (minutes <= 0) {
    txt = "Latest Recorded Lag: " + seconds + " seconds";
  } else {
    seconds = Math.round(seconds - (minutes * 60));
    if (minutes == 1) {
      txt = "Latest Recorded Lag: " + minutes + " minute and " + seconds + " seconds";
    } else {
      txt = "Latest Recorded Lag: " + minutes + " minutes and " + seconds + " seconds";
    }
  }
	return txt;
}
