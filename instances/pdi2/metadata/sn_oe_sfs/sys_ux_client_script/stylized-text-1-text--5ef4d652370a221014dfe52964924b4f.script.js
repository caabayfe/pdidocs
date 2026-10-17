/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.pageParams.channel == "teams")
	  return 'Microsoft Teams channel';
  else if(api.state.pageParams.channel == "slack")
    return 'Slack channel';
  else if(api.state.pageParams.channel == "workplace")
    return 'Workplace channel';
  else if(api.state.pageParams.channel == "messenger")
    return 'Messenger channel'; 
  else if(api.state.pageParams.channel == "line")
    return 'Line channel';    
  else if(api.state.pageParams.channel == "google-chat")
    return 'Google Chat channel'; 
}
