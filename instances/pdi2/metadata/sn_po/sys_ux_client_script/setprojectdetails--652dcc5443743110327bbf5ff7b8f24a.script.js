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
    const {
        projectNumber,
        state,
        status,
        goal,
        name,
        description,
        sysCreatedBy,
        projectEntities,
        source,
    } = api.data.get_project_details_1.output.data.GlidePromin_Query.projectConfiguration;

    const ismining = state.value === "MINING_DATA" || state.value === "SCHEDULED";
    const isMaint = api.context.session.user.roles?.includes('maint');
    const isFreemium = source.startsWith('FREEMIUM');

    const projectData = {
        ...api.state.projectData,
        projectNumber,
        miningState: state,
        status,
        createdBy: sysCreatedBy,
        goal,
        name,
        description,
        ismining,
        source,
        readonly: (!isMaint && isFreemium) || ismining,
    };
    api.setState('projectData', projectData);
    const parentEntity = projectEntities.find((entity) => entity.parentId==null);
    const activities = parentEntity.activities.map(activity=>activity.field);
    api.setState('activities', activities);
    // Set project name in workspace tab title
    if (projectData.name) {
        helpers.screen.updateStatus({
            title: await helpers.translate('{0} | Set improvement opportunities', projectData.name),
        });
    }
    const stages= [
        {
            "id": "set-objectives",
            "label": await helpers.translate("Set objectives"),
            "progress": "done"
        },
        {
            "id": "scope-your-analysis",
            "label": await helpers.translate("Scope your analysis"),
            "progress": "done"
        },
        {
            "id": "find-improvement-opportunities",
            "label": await helpers.translate("Set improvement opportunities"),
            "progress": "none"
        },
        {
            "id": "overview",
            "label": await helpers.translate("Review and mine"),
            "progress": "none"
        }
    ];

    api.setState('stageItems',stages);
    api.data.model_list_fetch.refresh();
}
