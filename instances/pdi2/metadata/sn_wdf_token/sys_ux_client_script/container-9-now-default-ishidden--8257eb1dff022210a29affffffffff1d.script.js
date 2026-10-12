/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var hideComponent = true;
  var output = api.data.average_token_usage.output;

  if (output === "" || output == null){
    hideComponent = false;
  }
  return hideComponent;
}
