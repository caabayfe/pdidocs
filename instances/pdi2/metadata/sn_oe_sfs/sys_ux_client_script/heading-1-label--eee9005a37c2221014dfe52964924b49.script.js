/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let channel_type = api.context.props.channelType;
  
  if(channel_type == 'teams')
      return 'Integrate Microsoft Teams with self configured bot';
  else if (channel_type == 'slack')
      return 'Integrate Slack with self configured bot';
  else if (channel_type == 'messenger')
      return 'Integrate Messenger with self configured bot'; 
  else if (channel_type == 'line')
      return 'Integrate Line with self configured bot';        
  else if (channel_type == 'google-chat')
      return 'Integrate Google Chat with self configured bot';   
}
