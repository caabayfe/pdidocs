/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const status = api.context.props.payload.status;
  const installed = status === 'installed';
  return `${installed ? 'Go to ' : 'Get '} ${api.context.props.payload.title}`;
}
