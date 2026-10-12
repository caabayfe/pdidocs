/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const status = api.state.status || (api.context.props.data ? api.context.props.data.status : null);
  return status === 'installing';
}
