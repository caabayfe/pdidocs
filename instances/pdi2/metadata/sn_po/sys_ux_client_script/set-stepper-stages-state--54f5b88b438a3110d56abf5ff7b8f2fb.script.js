/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.elementId == "get_project_details_1") {
        const {
            findingsCount,
            automatedFindingsCount,
        } = api.data.get_project_details_1.output.data.GlidePromin_Query.projectConfiguration;
        const findingCount = parseInt(automatedFindingsCount) + parseInt(findingsCount);
        const stageItems = api.state.stageItems.map((item) => {
            let state = 'done';
            if (item.id === 'find-improvement-opportunities') {
                state = findingCount > 0 ? 'done' : 'none';
            }
            return { ...item,
                disabled: false,
                progress: state
            };
        });
        api.setState('stageItems', stageItems);
        api.data.is_scope_analysis_stage_enabled.refresh();
    }
    const isScopeExists = api.data.is_scope_analysis_stage_enabled.output.data.snPo.GlidePromin.prominIsScopeEnabled.result;
    if (!isScopeExists) {
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'scope-your-analysis'
        }, null, true);
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    }
    const stageItems = api.state.stageItems.map((item) => {
        if (item.id === 'scope-your-analysis') {
            return { ...item,
                disabled: false,
                progress: 'done',
            };
        }
        return item;
    });
    api.setState('stageItems', stageItems);
    
}
