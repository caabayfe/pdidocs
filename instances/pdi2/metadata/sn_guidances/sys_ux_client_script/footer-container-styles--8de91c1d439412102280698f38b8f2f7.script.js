/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var description = api.state.customExpProps ? api.state.customExpProps.description : '';
  if (description) {
    return '';
  }

  return {
    "padding-top": "var(--now-scalable-space--md)"
  };
}
