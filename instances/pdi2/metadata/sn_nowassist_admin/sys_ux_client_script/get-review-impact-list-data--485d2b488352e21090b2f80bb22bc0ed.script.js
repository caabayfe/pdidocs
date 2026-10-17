/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    //Get review impact
    const rows = [];
    let skillList = [];
    if (api?.state?.showInstanceImpactCount) {
        // Flatten and enrich all skills from skillCapabilityMapping
        skillList = Object.values(api.state.skillCapabilityMapping)
            .flat()
            .map(skill => ({
                ...skill,
                selectionType: 'oobSkill',
                userSeletedProvider: api.state.instanceLevelProviderUpdatePayload?.[0]?.provider?.label || '',
                userSeletedProviderId: api.state.instanceLevelProviderUpdatePayload?.[0]?.provider?.id || ''
            }));
    } else {
        const repeaterItems = api?.state?.customSelectedItems || [];
        if (!repeaterItems.length) return { rows };
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
    }
    skillList = Object.values(
        skillList.reduce((acc, item) => {
            if (!acc[item.id]) {
                acc[item.id] = item;
            }
            return acc;
        }, {})
    );

        var filteredSkillList = skillList;
    
    if (!Array.isArray(filteredSkillList)) return { rows };
    var currentPageNumber = 0;

    if (event.name == "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET") {
        currentPageNumber = event.payload.value
    }
    if (event?.payload?.searchTerm?.length > 0 || api.state.searchTerm) {
        if (event.elementId == 'review_impact_search_input') {
            api.setState("searchTerm", event?.payload?.searchTerm)
            filteredSkillList = searchServices(filteredSkillList, event?.payload?.searchTerm)
        } else {
            filteredSkillList = searchServices(filteredSkillList, api.state.searchTerm)
        }

    }
    var data ={ ...api.state?.skillCapabilityMapping }
    var updatedSkillList = [];
    filteredSkillList.forEach(skill => {
        for (const key in data) {
            const items = data[key];
            items.forEach(item => {
                if (item.id == skill.id) {
                        addAllCapabilitySkills(items, updatedSkillList, skill.selectionType, skill.selectedProvider, data)

                }
            });
        }
    });
var updatedSkillList = updatedSkillList.filter(item =>
        item.providerId !== skillList[0].userSeletedProviderId
    );
    const currentPageSize = api.state?.currentPageSize || 10;
    api.setState('filteredSkillListCount', updatedSkillList?.length)
    updatedSkillList.sort((firstSkill, secondSkill) => firstSkill.label.localeCompare(secondSkill.label));
    updatedSkillList = getDataforPagination(updatedSkillList, currentPageNumber, currentPageSize);
    api.setState('reviewImpactCurrentPageNumber', currentPageNumber);
    updatedSkillList.forEach(async skill => {
        const skillData = skill
        const skillId = skillData?.id
        const providerName = skillData?.currentProvider || skill?.default_provider || '';
        const defaultLlmProvider = skillData?.userSeletedProvider || '';

        rows.push({
             key: `${skillId}_${skillData.capabilityId}_${Date.now()}`,
            cells: {
                status: {

                    componentProps: {
                        "bare": true,
                        "hidePadding": false,
                        "size": "md",
                        "tooltipContent": await getSkillToolTip(skill.skill_status),
                        "style": {
                            "background": _getStatusColor(skill.skill_status),
                            "height": "17px",
                            "width": "17px",
                            "border-radius": "17px",
                            "margin-left": "17px"
                        }
                    }
                },
                skillName: {
                    value: skill.label,
                    label: skill.label,
                    id: skill.label
                },
                currentProvider: {
                    value: providerName,
                    label: providerName,
                    id: providerName
                },
                product: {
                    value: skill.product_name,
                    label: skill.product_name,
                    id: skill.product_name
                },
                type: {
                    value: skill.type,
                    label: skill.type,
                    id: skill.type
                },
                defaultLlmProvider: {
                    value: providerName,
                    label: providerName,
                    id: providerName
                }
            }
        });
    });
    api.setState('filteredSkillList', { rows })
    return { rows };



    function _getStatusColor(status) {
        const statusColors = {
            active: "rgb(var(--now-color_alert--positive-2))",
            inactive: "rgb(var(--now-color_alert--critical-3))",
            draft: "rgb(var(--now-color_alert--warning-3))"
        };
        return statusColors[status] || "rgb(var(--now-color--neutral-5))"
    }

    async function getSkillToolTip(status) {
        const skillStatusLableMapping = {
            active: await helpers.translate("Active"),
            inactive: await helpers.translate("Inactive"),
            draft: await helpers.translate("Draft"),
            notconfigured: await helpers.translate("Not started")
        };
        return skillStatusLableMapping[status] || status

    }

    function getDataforPagination(skillList, page, pageSize) {
        const start = page * pageSize;
        return skillList.slice(start, start + pageSize);
    }

    function searchServices(skillList, searchTerm) {
        const term = searchTerm.toLowerCase();
        return skillList.filter(obj =>
            Object.values(obj).some(value =>
                String(value).toLowerCase().includes(term)
            )
        );
    }

    function addAllCapabilitySkills(allMatchingSkills, updatedSkillList, selectionType, selectedProvider, data) {
        allMatchingSkills.forEach(skill => {
            // Avoid duplicates
            if (!updatedSkillList.some(s => s.id === skill.id)) {
            skill.selectionType = selectionType;
            skill.selectedProvider = selectedProvider;
            updatedSkillList.push(skill);

            // Recursively find and add nested matching skills by ID
            for (const key in data) {
                const nestedSkills = data[key];
                nestedSkills.forEach(item => {
                    if (item.id === skill.id) {
                        delete data[key];
                        addAllCapabilitySkills(nestedSkills, updatedSkillList, selectionType, selectedProvider, data);
                    }
                });
            }
             }
        });

        return updatedSkillList;
    }

}
