/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */

function evaluateProperty({
    api,
    helpers
}) {

    const rows = [];
    const skillList = api?.item?.value?.skillList;
    if (!Array.isArray(skillList)) return {
        rows
    };
    skillList.forEach((item) => {
        const skillId = item?.id;
        const providerName = item?.default_provider;
        const userSelectedProvider = api?.item?.value?.currentProvider?.label || '';

        const row = {
            key: skillId + '_' + Date.now(),
            cells: {
                status:
                {
                    componentProps: {
                        "bare": true,
                        "hidePadding": false,
                        "size": "md",
                        "tooltipContent": getSkillToolTip(item?.skill_status),
                        "style": {
                            "background": _getStatusColor(item?.skill_status),
                            "height": "17px",
                            "width": "17px",
                            "border-radius": "17px",
                            "margin-left": "17px"
                        }
                    }

                },
                skillName: {
                    value: item?.label,
                    label: item?.label,
                    id: item?.label
                },
                currentProvider: {
                    value: providerName,
                    label: providerName,
                    id: providerName
                },
                defaultLlmProvider: {
                    value: userSelectedProvider,
                    label: userSelectedProvider,
                    id: userSelectedProvider
                }
            }
        };
        rows.push(row);
    });

    function getStatusComponentProps(status) {
        return {
            "bare": true,
            "hidePadding": false,
            "size": "md",
            "tooltipContent": status,
            "style": {
                "background": _getStatusColor(status),
                "height": "17px",
                "width": "17px",
                "border-radius": "17px",
                "margin-left": "17px"
            }
        }
    }
    function _getStatusColor(status) {
        const statusColors = {
            'active': "rgb(var(--now-color_alert--positive-2))",
           'anactive': "rgb(var(--now-color_alert--critical-3))",
            'draft': "rgb(var(--now-color_alert--warning-3))"
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


    return {
        rows
    };
}
