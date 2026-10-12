/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var hideComponent = true;
  var output = api.data.total_tokens_used.output;

  if (output === "" || output == null){
    hideComponent = false;
  }
  return hideComponent;
}
