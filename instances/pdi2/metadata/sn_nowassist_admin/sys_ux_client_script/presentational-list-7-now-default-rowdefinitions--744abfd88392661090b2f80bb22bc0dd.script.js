/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    const rows = [];
    var updatedSkills = api?.state?.modalUpdateSkillStatus?.updatedSkills || [];
    var searchTerm = api.state['interruptionModelSearchTerm'];

    if (!Array.isArray(updatedSkills) || updatedSkills.length === 0) return { rows };
    updatedSkills.sort((firstSkill, secondSkill) => firstSkill.label.localeCompare(secondSkill.label));

    if (searchTerm?.length > 0) {
        updatedSkills = searchServices(updatedSkills, searchTerm)
    }

    for (const skill of updatedSkills) {
        rows.push(constructRow(skill));
    }

    return { rows };

    // --- Helpers ---
    // --- Helpers ---

    function searchServices(skillList, searchTerm) {
        const lowerSearchKey = searchTerm.toLowerCase();
        return skillList.filter(item =>
            item.label && item.label.toLowerCase().includes(lowerSearchKey)
        );
    }

    function constructRow(skill) {

        const { id, label, product_name, type } = skill;


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
                type: {
                    value: type,
                    label: type,
                    id: type
                },
                product: {
                    value: product_name,
                    label: product_name,
                    id: product_name
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
            active: helpers.translateSync("Active"),
            inactive: helpers.translateSync("Inactive"),
            draft: helpers.translateSync("Draft"),
            notconfigured: helpers.translateSync("Not started")
        };
        return skillStatusLableMapping[status] || status

    }
}
