/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var hideComponent = false;
  var output = api.data.average_token_usage.output;

  if (output === "" || output == null){
    hideComponent = true;
  }
  return hideComponent;
}
