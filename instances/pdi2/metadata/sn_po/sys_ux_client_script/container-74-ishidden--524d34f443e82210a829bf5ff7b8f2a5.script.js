/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const projectDetails = api.state.projectDetails;
    if (projectDetails.source && projectDetails.source.value && projectDetails.source.value.startsWith('FREEMIUM')) {
        return false;
    }
    return true;
}
