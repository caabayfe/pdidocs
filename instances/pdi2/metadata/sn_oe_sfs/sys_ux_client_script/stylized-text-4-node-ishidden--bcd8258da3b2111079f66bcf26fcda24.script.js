/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers1
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.payload.pageParams.channel == "teams" && api.data.look_up_records_1.results.length > 0){
	  return true;
  }
  else if(api.context.props.payload.pageParams.channel == "workplace" && api.data.look_up_records_3.results.length > 0){
	  return true;
  }
  else if(api.context.props.payload.pageParams.channel == "slack" && api.data.look_up_records_4.results.length > 0){
	  return true;
  }
}
