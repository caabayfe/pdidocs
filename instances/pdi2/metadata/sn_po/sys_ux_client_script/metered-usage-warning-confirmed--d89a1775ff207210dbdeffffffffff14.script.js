/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        api.data.fetch_mine_project.execute({
            'sysId': api.context.props.projectId,
            'preview': false
        });
}
