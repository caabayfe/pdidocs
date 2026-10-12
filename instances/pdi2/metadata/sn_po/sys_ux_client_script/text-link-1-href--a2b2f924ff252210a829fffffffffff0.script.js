/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    return `https://www.servicenow.com/docs/?context=process-config-builder&version=${api.state.releaseVersion}`;
}
