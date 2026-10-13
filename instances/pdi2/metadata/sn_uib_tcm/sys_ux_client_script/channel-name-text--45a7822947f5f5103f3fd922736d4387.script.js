/**
  * @param {params} params 
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var channelName =  api.item.value.comm_channel_config.display_value;
  if (api.item.index < api.item.parent.value.channels.length - 1) channelName += ", ";
  return channelName;
}
