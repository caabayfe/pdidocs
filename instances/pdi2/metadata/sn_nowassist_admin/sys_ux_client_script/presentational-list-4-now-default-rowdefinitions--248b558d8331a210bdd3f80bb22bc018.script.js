/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
    const rows = [];
    var searchTerm = api.state['interruptionModelSearchTerm'];

    var skillList = api?.item?.value?.skillList || [];

    skillList.sort((firstSkill, secondSkill) => firstSkill.label.localeCompare(secondSkill.label));

    if (searchTerm?.length > 0) {
        skillList = searchServices(skillList, searchTerm)
    }
    skillList.forEach(item => {
        var row = constructRow(item)
        rows.push(row);
    });



    function searchServices(skillList, searchTerm) {
        const lowerSearchKey = searchTerm.toLowerCase();
        return skillList.filter(item =>
            item.label && item.label.toLowerCase().includes(lowerSearchKey)
        );
    }

    function constructRow(skillData) {
        return {
            key: skillData.id,
            cells: {
                status: {
                    componentProps: {
                        "bare": true,
                        "hidePadding": false,
                        "size": "md",
                        "tooltipContent": getSkillToolTip(skillData.skill_status),
                        "style": {
                            "background": _getStatusColor(skillData.skill_status),
                            "height": "17px",
                            "width": "17px",
                            "border-radius": "17px",
                            "margin-left": "17px"
                        }
                    }
                },
                error: {
                    value: skillData?.error,
                    label: skillData?.error,
                    id: skillData?.error
                },
                skillName: {
                    value: skillData?.label,
                    label: skillData?.label,
                    id: skillData?.label
                },
                type: {
                    value: skillData?.type,
                    label: skillData?.type,
                    id: skillData?.type
                },
                currentProvider: {
                    value: skillData?.default_provider || '',
                    label: skillData?.default_provider || '',
                    id: skillData?.default_provider || ''
                }
            }
        };
    }
    function getSkillToolTip(status) {
         const skillStatusLableMapping =  {
            active: "Active",
            inactive: "Inactive",
            draft: "Draft",
            notconfigured:"Not started"
        };
        return skillStatusLableMapping[status] || status

    }

    function _getStatusColor(status) {
        const statusColors = {
            active: "rgb(var(--now-color_alert--positive-2))",
            inactive: "rgb(var(--now-color_alert--critical-3))",
            draft: "rgb(var(--now-color_alert--warning-3))"
        };
        return statusColors[status] || "rgb(var(--now-color--neutral-5))"
    }
    return { rows };
}
