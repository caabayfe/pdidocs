/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const AGENT_WORKFLOW_TAB_ID = 'id=agentic_workflows_disabled';
    const AGENT_TAB_ID = 'id=ai_agents_disabled';
    const OOB_SKILL_TAB = 'id=oob_skill_tab'
    
    var isAgent = true;
     if (event.name == "UXF_TAB_SET#TAB_SELECTED"  && event.payload.selectedTab === OOB_SKILL_TAB) {
        return;
    }
    if (event.name == "UXF_TAB_SET#TAB_SELECTED"  && event.payload.selectedTab === AGENT_WORKFLOW_TAB_ID) {
        isAgent = false;
    }
     if (event.name == "SN_SEARCH_COMBOBOX#SEARCH_EXECUTED" && event.elementId == 'ai_agent_workflow_search_input') {
      isAgent = false;
     } 
     if (event.name == 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET' && event.elementId == 'agentic_workflow_pagination_control') {
        isAgent = false
     }
    const rows = [];
    let aiAgentList = isAgent ? api.state.disabledAgentList : api.state.disabledAgenticWorkflow;
  

    if (!Array.isArray(aiAgentList)) return { rows };

    if (event?.payload?.searchTerm?.length > 0 || api.state.searchTerm) {
        api.setState("searchTerm", event?.payload?.searchTerm)
        aiAgentList = searchServices(aiAgentList, event?.payload?.searchTerm)
    }
    var currentPageNumber = 0;

    if (event.name == "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET") {
        currentPageNumber = event.payload.value;
    }
    const currentPageSize = api.state?.currentPageSize || 10;
    isAgent ? api.setState('filteredAgentListCount', aiAgentList?.length) : api.setState('disabledAgenticWorkflowCount', aiAgentList?.length)
    aiAgentList.sort((firstAgentName, secondAgentName) => firstAgentName.name.localeCompare(secondAgentName.name));
    aiAgentList = getDataForPagination(aiAgentList, currentPageNumber, currentPageSize);
    api.setState('currentPageNumber',currentPageNumber);
    aiAgentList.forEach(item => {

        rows.push({
            key: `${Math.random().toString(36).substring(2)}`,
            cells: {
                status: {

                    componentProps: {
                        "bare": true,
                        "hidePadding": false,
                        "size": "md",
                        "tooltipContent": item.status,
                        "style": {
                            "background": _getStatusColor(item.status),
                            "height": "17px",
                            "width": "17px",
                            "border-radius": "17px",
                            "margin-left": "17px"
                        }
                    }
                },
                name: {
                     componentProps: {
                        value: item.name,
                            "label": item.name,
                            "href": item.link,
                            "opens-window": true
                        }
                },
                current_provider: {
                    value: item.currentProvider,
                    label: item.currentProvider,
                    id: item.currentProvider
                }
            }
        });
    });
    isAgent ? api.setState('filteredAgentList', { rows }) : api.setState('filteredDisabledAgenticWorkflow', { rows })
    return { rows };


    function _getStatusColor(status) {
        const statusColors = {
            'Active': "rgb(var(--now-color_alert--positive-2))",
            'Inactive': "rgb(var(--now-color_alert--critical-3))",
            'Draft': "rgb(var(--now-color_alert--warning-3))"
        };
        return statusColors[status] || "rgb(var(--now-color--neutral-5))"
    }

    function getDataForPagination(skillList, page, pageSize) {
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
