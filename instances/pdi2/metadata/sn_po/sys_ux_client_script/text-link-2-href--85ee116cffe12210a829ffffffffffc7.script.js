/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
 return `https://www.servicenow.com/docs/?context=po-content-pack&version=${api.state.releaseVersion}`;
}
