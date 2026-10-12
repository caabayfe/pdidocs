/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let alertMessages = [];
  if(api.state.authScopeError == 'existingNewAuthScope')
    alertMessages.push({
      content: api.state.translatedMessages.existingNewAuthScope,
      icon: "circle-info-outline",
      status: "critical"
    });
  if(api.state.authScopeError == 'failedNewAuthScope')
    alertMessages.push({
      content: api.state.translatedMessages.failedNewAuthScope,
      icon: "circle-info-outline",
      status: "critical"
    });
  return alertMessages;
}
