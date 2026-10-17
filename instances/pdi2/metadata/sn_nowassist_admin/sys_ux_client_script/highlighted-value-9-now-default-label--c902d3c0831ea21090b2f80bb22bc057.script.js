/**
 * @param {Object} params
 * @param {Object} params.api
 * @param {TransformApiHelpers} params.helpers
 * @returns {number} impactedSkillCount
 */
function evaluateProperty({ api, helpers }) {
    let impactedSkillCount = 0;
    let skillList = [];
    const scopeType = api?.state?.scopeTypeSelection;
    if (scopeType === 'instanceLevel' && api?.state?.instanceLevelProviderUpdatePayload) {
        skillList = Object.values(api.state.skillCapabilityMapping)
            .flat()
            .map(skill => ({
                ...skill,
                selectionType: 'oobSkill',
                userSeletedProvider: api.state.instanceLevelProviderUpdatePayload?.[0]?.provider?.label || '',
                userSeletedProviderId: api.state.instanceLevelProviderUpdatePayload?.[0]?.provider?.id || ''
            }));
        var filteredSkillList = skillList.filter(item => item.providerId != item.userSeletedProviderId);
        filteredSkillList = Object.values(
            filteredSkillList.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = item;
                }
                return acc;
            }, {})
        );
        impactedSkillCount = filteredSkillList.length;
    } else {
        const repeaterItems = api?.state?.customSelectedItems || [];
        repeaterItems.forEach(({ skillList: skills = [], selectionType, currentProvider }) => {
            skills.forEach(skill => {
                const existingIndex = skillList.findIndex(s => s.id === skill.id);
                const enrichedSkill = {
                    ...skill,
                    selectionType,
                    userSeletedProvider: currentProvider?.label || '',
                    userSeletedProviderId: currentProvider?.id || ''
                };

                if (existingIndex !== -1) {
                    skillList[existingIndex] = { ...skillList[existingIndex], ...enrichedSkill };
                } else {
                    skillList.push(enrichedSkill);
                }
            });
        });

        var filteredSkillList = skillList.filter(item => item.providerId != item.userSeletedProviderId);
        filteredSkillList = Object.values(
            filteredSkillList.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = item;
                }
                return acc;
            }, {})
        );
        impactedSkillCount = filteredSkillList.length;
    }

    impactedSkillCount = api.state?.filteredSkillListCount  || impactedSkillCount;

    if (api?.state?.aiAgentList?.length > 0) {
        impactedSkillCount = impactedSkillCount + api?.state?.aiAgentList?.length;
    }

    return impactedSkillCount;
}
