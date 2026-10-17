/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers123
  */
function evaluateProperty({api, helpers}) {
    if(api.context.props.payload.pageParams.channel == "teams")
	    return api.data.look_up_records_2.results;

     else if(api.context.props.payload.pageParams.channel == "slack")
	      return api.data.look_up_records_5.results;
     else if(api.context.props.payload.pageParams.channel == "messenger")
	      return api.data.look_up_records_6.results;
  else if(api.context.props.payload.pageParams.channel == "line")
	      return api.data.look_up_records_7.results;
   else if (api.context.props.payload.pageParams.channel == "google-chat")
	      return api.data.google_chat_lookup_records.results;
}
