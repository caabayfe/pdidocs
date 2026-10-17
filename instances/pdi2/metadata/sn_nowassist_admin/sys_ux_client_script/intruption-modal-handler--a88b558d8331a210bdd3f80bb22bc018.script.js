/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event }) {
    const modalUpdateSkillStatus = api?.state?.modalUpdateSkillStatus;
    if (!modalUpdateSkillStatus) return;
    const { failedGroupsAndSkills } = modalUpdateSkillStatus;
    const groupIndex = event?.context?.item?.index;

    if (
        !Array.isArray(Object.entries(failedGroupsAndSkills)) ||
        typeof groupIndex !== 'number'
    ) return;

    const groupKeys = Object.keys(failedGroupsAndSkills);
    const groupKey = groupKeys[groupIndex];
    if (!groupKey) return;

    const group = failedGroupsAndSkills[groupKey];
    if (!Array.isArray(group) || !group[0]) return;

    group[0].showIntruptionModalGroupSkillList = !group[0].showIntruptionModalGroupSkillList;

    api.setState('modalUpdateSkillStatus', structuredClone(modalUpdateSkillStatus));
}
