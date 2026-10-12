/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var url = '';

  if (api.context.props.channelType == 'teams')
    url = '/api/now/v1/context_doc_url/multi-instance-teams';

  if (api.context.props.channelType == 'slack')
    url = '/api/now/v1/context_doc_url/integ-slack-self-config-bot';

  if (api.context.props.channelType == 'messenger')
    url = '/api/now/v1/context_doc_url/va-fb-messenger-integration';

  if (api.context.props.channelType == 'line')
    url = '/api/now/v1/context_doc_url/va-line--integration';    
  
  if (api.context.props.channelType == 'google-chat')
    return `<p> Complete all information.</p>`;
  return `<p>Complete all information. To learn more, refer the <a href='` + url + `' target='_blank' style='cursor:pointer;text-decoration:none;color: rgb(1, 119, 142);'>step-by-step guide.</a><p>`;
}
