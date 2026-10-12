/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers123
  */
function evaluateProperty({api, helpers}) {
    if(api.context.props.payload.pageParams.channel == "teams")
	    return api.data.look_up_records_1.results;
    else if(api.context.props.payload.pageParams.channel == "workplace")
	    return api.data.look_up_records_3.results;
    else if(api.context.props.payload.pageParams.channel == "slack")
	    return api.data.look_up_records_4.results;
}
