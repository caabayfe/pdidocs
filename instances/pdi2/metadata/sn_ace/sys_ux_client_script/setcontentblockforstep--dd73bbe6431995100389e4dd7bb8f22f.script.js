/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {

  const { children } = api.context.props.payload;
  if (!children || !children.length) {
    return [];
  }

  return children.find((element) => element.name === api.state.selectedStep);
}
