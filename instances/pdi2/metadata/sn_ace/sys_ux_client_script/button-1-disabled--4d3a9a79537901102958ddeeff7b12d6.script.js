/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const status = api.state.status || (api.context.props.payload ? api.context.props.payload.status : null);
  return status === 'installing';
}
