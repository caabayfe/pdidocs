/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var hideComponent = false;
  var output = api.data.total_tokens_remaining.output;
  
  if(output == "" || output == null){
    hideComponent = true;
  }
	return hideComponent;
}
