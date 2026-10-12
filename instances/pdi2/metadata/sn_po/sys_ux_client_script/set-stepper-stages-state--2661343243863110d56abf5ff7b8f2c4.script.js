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
    if (event.elementId == 'get_project_details_1') {
        if (event.name == "DATA_FETCH_SUCCEEDED") {
            const projectDetails = api.data.get_project_details_1.output.data.GlidePromin_Query.projectConfiguration;
            const primaryEntity = projectDetails.projectEntities.find(item => item.parentId == null);
            if (primaryEntity.sourceType.value == "PLAYBOOK_DATA") {
                // remove impr opp stage from the stepper sequence. and make it scope analysis disable false
                const newStages = api.state.stageItems.filter(stage => stage.id !== 'find-improvement-opportunities');
                api.setState('stageItems', newStages);
                api.setState('sourceType', 'PLAYBOOK_DATA');
            } else {
                const {
                    automatedFindingsCount,
                    findingsCount,
                } = api.data.get_project_details_1.output.data.GlidePromin_Query.projectConfiguration;
                const findingCount = parseInt(automatedFindingsCount) + parseInt(findingsCount);
                const findingCounts = parseInt(automatedFindingsCount) + parseInt(findingsCount);
                const stageItems = api.state.stageItems.map((item) => {
                    let state = item.progress;
                    if (item.id === 'find-improvement-opportunities') {
                        state = findingCounts > 0 ? 'done' : 'none';
                    }
                    return { ...item,
                        disabled: false,
                        progress: state
                    };
                });
                api.setState('stageItems', stageItems);
            }
        }
        api.data.fetch_available_versions.refresh();
        return;
    }
    if (event.elementId == "is_scope_analysis_stage_enabled") {
        const isScopeExists = api.data.is_scope_analysis_stage_enabled.output.data.snPo.GlidePromin.prominIsScopeEnabled.result;
        const stageItems = api.state.stageItems.map((item) => {
            let state = 'done';
            if (item.id === 'scope-your-analysis') {
                state = isScopeExists ? 'done' : 'none';
                return { ...item,
                    disabled: false,
                    progress: state
                };
            }
            if (item.id === 'find-improvement-opportunities' || item.id === 'overview') {
                return {
                    ...item,
                    disabled: !isScopeExists ? true : false,
                };
            }
            return item;
        });
        api.setState('stageItems', stageItems);
        return;
    }
    const comparableVersions = api.data.fetch_available_versions.output.data.GlidePromin_Query.comparableVersions;
    const stageItems = api.state.stageItems.map((item) => {
        if (item.id === 'overview') {
            return { ...item,
                disabled: false,
                progress: comparableVersions.length > 0 ? 'done' : 'none'
            };
        }
        return item;
    });
    api.setState('stageItems', stageItems);
    api.data.is_scope_analysis_stage_enabled.refresh();
}
