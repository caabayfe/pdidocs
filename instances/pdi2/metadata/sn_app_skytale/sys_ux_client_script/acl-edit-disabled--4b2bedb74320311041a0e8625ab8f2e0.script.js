/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.topicsAclConfig.readOnlyTopics.length != 0 || api.state.topicsAclConfig.readwriteTopics.length != 0) {
    return 'false';
  }
  
	return 'true';
}
