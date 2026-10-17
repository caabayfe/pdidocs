/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var searchTerm = api.state['interruptionModelSearchTerm'];
    const rows = [];
    var failedSkills = api ?.state ?.modalUpdateSkillStatus ?.failedSkills || [];

    if (searchTerm ?.length > 0) {
        failedSkills = searchServices(failedSkills, searchTerm)
    }

    failedSkills.sort((firstSkill, secondSkill) => firstSkill.label.localeCompare(secondSkill.label));

    if (!Array.isArray(failedSkills) || failedSkills.length === 0) return {
        rows
    };

    for (const skill of failedSkills) {
        rows.push(constructRow(skill));
    }

    return {
        rows
    };

    // --- Helpers ---

    function searchServices(skillList, searchTerm) {
        const lowerSearchKey = searchTerm.toLowerCase();
        return skillList.filter(item =>
            item.label && item.label.toLowerCase().includes(lowerSearchKey)
        );
    }

    function constructRow(skill) {

        const {
            id,
            label,
            error,
            default_provider,
            product_name,
            type
        } = skill;
        const providerName = default_provider || '';

        return {
            key: `${id}_${Date.now()}`, // Optional: replace Date.now() if stable keys are needed
            cells: {
                status: {
                    componentProps: {
                        "bare": true,
                        "hidePadding": false,
                        "size": "md",
                        "tooltipContent": getSkillToolTip(skill.skill_status),
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
                    value: label,
                    label: label,
                    id: label
                },
                product: {
                    value: product_name,
                    label: product_name,
                    id: product_name
                },
                type: {
                    value: type,
                    label: type,
                    id: type
                },
                currentProvider: {
                    value: providerName,
                    label: providerName,
                    id: providerName
                },
                error: {
                    value: error,
                    label: error,
                    id: error
                }
            }
        };
    }

    function _getStatusColor(status) {
        const statusColors = {
            active: "rgb(var(--now-color_alert--positive-2))",
            inactive: "rgb(var(--now-color_alert--critical-3))",
            draft: "rgb(var(--now-color_alert--warning-3))"
        };
        return statusColors[status] || "rgb(var(--now-color--neutral-5))"
    }

    function getSkillToolTip(status) {
        const skillStatusLableMapping = {
            active: "Active",
            inactive: "Inactive",
            draft: "Draft",
            notconfigured: "Not started"
        };
        return skillStatusLableMapping[status] || status

    }
}
