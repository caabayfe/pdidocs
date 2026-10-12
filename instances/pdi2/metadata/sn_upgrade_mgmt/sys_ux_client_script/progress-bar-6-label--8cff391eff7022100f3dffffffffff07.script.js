/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const data = api?.state?.upgradeDetails;
  if(data && data.totalCompletedTrackers && data.totalTrackers) {
    return helpers.translateSync("Loading plugins({0}/{1})", data.totalCompletedTrackers, data.totalTrackers);
  } else {
    return helpers.translateSync("Loading plugins");
  }
}
