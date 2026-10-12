/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const idList = api.state.selectedRecommendationRecords.toString();
  return 'sys_idIN' + idList;
}
