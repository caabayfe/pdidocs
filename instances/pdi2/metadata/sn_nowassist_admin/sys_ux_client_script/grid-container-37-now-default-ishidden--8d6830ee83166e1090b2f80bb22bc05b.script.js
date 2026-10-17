/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
  //give the count of skills failed during skills or group update
  const updateStatus = api?.state?.modalUpdateSkillStatus;

  const failedSkillsCount = Array.isArray(updateStatus?.failedSkills)
    ? updateStatus.failedSkills.length
    : 0;

  const failedGroupsItems = Object.values(updateStatus?.failedGroupsAndSkills || {});
  const flattenedItems = failedGroupsItems.flat();
  const failedGroupsCount = flattenedItems.length;
  const failedAgentAndWorkFlowCount = api.state?.failedDiabledAgentAndWorkflows?.length || 0;


  return !((failedSkillsCount + failedGroupsCount + failedAgentAndWorkFlowCount) > 0)
}
