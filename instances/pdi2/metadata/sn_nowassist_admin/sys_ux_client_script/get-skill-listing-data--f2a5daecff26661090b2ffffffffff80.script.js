/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {

    const rows = [];
    var skillList = event?.payload?.data?.output || api.state?.skillListData;
    if (skillList) {
        api.setState("skillListData", skillList);
    }

    var filteredSkillList = skillList;
    if (!Array.isArray(filteredSkillList)) return { rows };
    var currentPageNumber = 0;
    api.setState('currPageNumber', currentPageNumber);

    if (event.name == "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET") {
        currentPageNumber = event.payload.value
      
    }
    if (event?.payload?.searchTerm?.length > 0 || api.state.skillListSearchTerm) {
        if (event.elementId == 'search_input_2') {
            api.setState("skillListSearchTerm", event?.payload?.searchTerm)
            filteredSkillList = searchServices(filteredSkillList, event?.payload?.searchTerm)
        } else {
            filteredSkillList = searchServices(filteredSkillList, api.state.skillListSearchTerm)
        }


    }
    filteredSkillList.sort((firstSkill, secondSkill) => firstSkill.skill_name.localeCompare(secondSkill.skill_name));
    const currentPageSize = api.state?.currentPageSize || 10;
    api.setState('filteredSkillListCount', filteredSkillList.length)
    filteredSkillList = getDataforPagination(filteredSkillList, currentPageNumber, currentPageSize);
    api.setState('skillListCurrPageNumber', event.payload.value);


    filteredSkillList.forEach(async skill => {
        const skillData = skill
        const skillId = skillData?.sys_id
        const providerName = skillData?.provider_name || ''

        rows.push({
            key: `${skillId}_${Date.now()}`,
            cells: {
                status: {

                    componentProps: {
                        "bare": true,
                        "hidePadding": false,
                        "size": "md",
                        "tooltipContent": skill.status_tooltip,
                        "style": {
                            "background": _getStatusColor(skill.status),
                            "height": "17px",
                            "width": "17px",
                            "border-radius": "17px",
                            "margin-left": "17px"
                        }
                    }
                },
                oobSkillName: {
                    value: skill.skill_name,
                    label: skill.skill_name,
                    id: skill.skill_name
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
                defaultLlmProviders: {
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

}
