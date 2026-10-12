/**
 * @param {object} params
 * @param {object} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {

    const interdependentSkills = api?.state?.interdependent_skills;
    const dependentSkills = interdependentSkills?.dependentSkills;
    if (!Array.isArray(dependentSkills) || dependentSkills.length === 0) {
        return { rows: [] };
    }

    dependentSkills.sort((firstSkill, secondSkill) => firstSkill.label.localeCompare(secondSkill.label));

    const rows = construtRows(dependentSkills);

    function construtRows(dependentSkills) {
        return dependentSkills
            .map(skill => ({
                key: `${skill.id}_${skill.capabilityId}_${Date.now()}`,
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
                        value: skill.label,
                        label: skill.label,
                        id: skill.label
                    },
                    product: {
                        value: skill.product_name,
                        label: skill.product_name,
                        id: skill.product_name
                    }
                }
            }));

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
        return skillStatusLableMapping[status] || status;

    }
    return { rows };
}
