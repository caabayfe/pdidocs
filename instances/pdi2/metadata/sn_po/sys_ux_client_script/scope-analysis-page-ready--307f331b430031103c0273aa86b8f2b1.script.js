/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    helpers.screen.updateStatus({
        title: await helpers.translate('Scope your analysis')
    });

    api.setState('currentTableDisplayName', await helpers.translate('Entity'));
    api.setState('isPlaybookSourceTypeProject', false);
    api.data.is_shared_project.execute({
        projectId: api.context.props.projectId
    });
}
