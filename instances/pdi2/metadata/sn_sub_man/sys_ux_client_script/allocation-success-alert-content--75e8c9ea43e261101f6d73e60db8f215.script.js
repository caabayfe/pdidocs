/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const groupCount = api.state.allocatedGroupCount;
  const userCount = api.state.allocatedUserCount;
  const msg = helpers.translateSync('You added {0} groups, allocating {1} subscriptions.', groupCount, userCount);
  return msg;


}
