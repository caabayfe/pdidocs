/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let hide_button = (api.context.props.channel == 'workplace' || api.context.props.channel == 'messenger' || api.context.props.channel == 'line'|| api.context.props.channel == 'google-chat');
  return hide_button;
}
