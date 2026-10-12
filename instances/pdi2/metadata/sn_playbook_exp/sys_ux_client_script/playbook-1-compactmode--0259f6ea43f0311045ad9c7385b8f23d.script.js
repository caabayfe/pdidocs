/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const compactMode = api.context.props.compactMode;
  
  return (compactMode === true || compactMode === 'true');
}
