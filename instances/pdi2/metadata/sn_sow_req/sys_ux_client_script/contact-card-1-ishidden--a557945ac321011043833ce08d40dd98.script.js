/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.data.record_information__request_1.output && api.data.record_information__request_1.output.sourceInfo.name)
      return false;
  return true;
}
