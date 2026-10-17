/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var txt = "Connection last checked at: " + api.data.grab_server_status.results[0].sys_updated_on.displayValue;
  var zone = new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1];
	return txt + " " + zone;
}
