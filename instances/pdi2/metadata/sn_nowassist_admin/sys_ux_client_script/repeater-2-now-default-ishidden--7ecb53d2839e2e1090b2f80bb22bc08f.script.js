/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    const updateResult = api?.state?.modalUpdateSkillStatus;
    const result = [];

    if (!updateResult?.failedGroupsAndSkills) {
        return true;
    }

    for (const groupName in updateResult.failedGroupsAndSkills) {
        const skillList = updateResult.failedGroupsAndSkills[groupName].flat();

        if (skillList.length === 0) {
            continue;
        }

        result.push({
            skillList,
            groupName
        });

        return false; // Early return on first failure with skills
    }

    return true;
}
