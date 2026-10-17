/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.topicsAclConfig.permission == 'readwrite') {
    return 'readwrite';
  } else {
    return 'readOnly';
  }
}
