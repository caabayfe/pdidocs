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
    const modelSummaries = api.data.model_list_fetch.output.data.GlidePromin_Query.modelSummaryResult.modelSummaries;

    if (!Array.isArray(modelSummaries) || modelSummaries.length == 0) {
        api.data.get_project_details_1.refresh();
        return;
    }

    const {
        version: {
            id,
            projectDefinition: {
                permissions: {
                    canWrite,
                    canMine,
                    canDelete,
                },
            },
        }
    } = modelSummaries.find((model) => model.version.projectDefinition.projectId == api.context.props.projectId);

    let projectData = {
        ...api.state.projectData,
        canMine,
        versionId: id,
    };

    if (id == null) {
        const ismining = false;
        const isMaint = api.context.session.user.roles?.includes('maint');
        const isFreemium = projectData?.source?.startsWith('FREEMIUM');

        projectData = {
            ...projectData,
            ismining,
            versionId: "",
            readonly: (!isMaint && isFreemium) || ismining,
        };
    }

    api.setState("projectData", projectData);
}
