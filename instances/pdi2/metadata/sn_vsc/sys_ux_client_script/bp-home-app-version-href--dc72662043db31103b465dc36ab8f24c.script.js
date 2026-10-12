/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.bestPracticesAffectedData) {
    return "https://store.servicenow.com/sn_appstore_store.do#!/store/application/a51d46e3f2014110366b10017c5ba675/" + api.state.bestPracticesAffectedData.release_version;
  }
  return "";
}
