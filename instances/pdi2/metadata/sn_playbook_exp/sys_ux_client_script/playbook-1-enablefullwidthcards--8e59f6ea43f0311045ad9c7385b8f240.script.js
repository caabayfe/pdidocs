/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const fullWidthCards = api.context.props.fullWidthCards;

  return(fullWidthCards === true || fullWidthCards === 'true');
}
