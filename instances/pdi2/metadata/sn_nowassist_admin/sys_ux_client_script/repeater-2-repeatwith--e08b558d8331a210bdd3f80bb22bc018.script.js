/**
* @param {params} params
* @param {api} params.api
* @param {TransformApiHelpers} params.helpers
*/
function evaluateProperty({ api, helpers }) {
    const partiallyUpdateResult = api?.state?.modalUpdateSkillStatus;
    var result = [];

    if (partiallyUpdateResult) {
        for (const failedGroupAndSkills in partiallyUpdateResult?.failedGroupsAndSkills) {

            const skillList = partiallyUpdateResult?.failedGroupsAndSkills[failedGroupAndSkills].flat();

        if (skillList.length === 0) {
            continue;
        }

            var item = {
                skillList,
                groupName: failedGroupAndSkills
            }
            result.push(item)
        }
    }
    return result;
}
