/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.elementId == 'get_project_details_1') {
        const {
            automatedFindingsCount,
            findingsCount,
            projectEntities
        } = api.data.get_project_details_1.output.data.GlidePromin_Query.projectConfiguration;
        const parentEntity = projectEntities.find(entity => entity.parentId == null);
        api.setState('rootActivitycount',parentEntity.activities.length);
        const findingCount = parseInt(automatedFindingsCount) + parseInt(findingsCount);
        const stageItems = api.state.stageItems.map((item) => {
            if (item.id === 'find-improvement-opportunities') {
                return { ...item,
                    disabled: false,
                    progress: findingCount > 0 ? 'done' : 'none'
                };
            }
            return item;
        });
        api.setState('stageItems', stageItems);
        api.data.fetch_available_versions.refresh();
        return;
    }
    
    let projectDetails = api.data.get_project_details.result;

    const ismining = projectDetails.state.value === "MINING_DATA" || projectDetails.state.value === "SCHEDULED";
    const isMaint = api.context.session.user.roles?.includes('maint');
    const isFreemium = projectDetails.source.value.startsWith('FREEMIUM');
    
    projectDetails = {
        ...projectDetails,
        ismining,
        readonly: (!isMaint && isFreemium) || ismining,
    };

    api.setState('projectDetails', projectDetails);

    // Set project name in workspace tab title
    if (projectDetails.name && projectDetails.name.value) {
        helpers.screen.updateStatus({
            title: await helpers.translate('{0} | Scope your analysis', projectDetails.name.value),
        });
    }
}
