/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const status = api.context.props.data.status;
  const installed = status === 'installed';
  return `${installed ? 'Go to ' : 'Get '} ${api.context.props.data.title}`;
}
