/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    // Get the findings
    const { Findings: findings } = api.data.fetch_promin_findings_1.output.data.GlidePromin_Query;
    const { SUMMARY_AND_INSIGHTS, OPPORTUNITY_DETAILS, ANALYST_WORKBENCH, AUTOMATION_OPPORTUNITIES, KPI_DASHBOARD, PLAYBOOK_WORKBENCH } = api.state.TAB_ITEMS;

    // Fallback code in-case somehow selected-tab-index is set in URL
    const selectedTabIndex = api.context.props.selectedTabIndex;
    if (typeof selectedTabIndex === 'number' && !isNaN(selectedTabIndex)) {
        let selectedTab = ANALYST_WORKBENCH;
        switch (selectedTabIndex) {
            case 0:
                selectedTab = SUMMARY_AND_INSIGHTS;
                break;
            case 1:
                selectedTab = OPPORTUNITY_DETAILS;
                break;
            case 2:
                selectedTab = ANALYST_WORKBENCH;
                break;
            case 3:
                selectedTab = AUTOMATION_OPPORTUNITIES;
                break;
            case 4:
                selectedTab = KPI_DASHBOARD;
                break;
            case 5:
                selectedTab = PLAYBOOK_WORKBENCH;
                break;
        }

        api.emit("CONTENT_UPDATED", {
            params: {
                selectedTab,
                selectedTabIndex: null,
            }
        });

        return;
    }

    if (api.state.isPlaybookProject) {
        api.emit("CONTENT_UPDATED", {
            params: {
                selectedTab: PLAYBOOK_WORKBENCH,
            }
        });
        return;
    }
    // If props contains selectedTab, do not switch
    // Else if there is a model, but there are no findings, then switch to the workbench
    if(!api.context.props.selectedTab) {
        api.emit("CONTENT_UPDATED", {
            params: {
                selectedTab: findings?.length ? SUMMARY_AND_INSIGHTS : ANALYST_WORKBENCH,
            }
        });
    } else {
        api.emit("CONTENT_UPDATED", {
            params: {
                selectedTab: api.context.props.selectedTab || SUMMARY_AND_INSIGHTS,
            }
        });
    }
}
