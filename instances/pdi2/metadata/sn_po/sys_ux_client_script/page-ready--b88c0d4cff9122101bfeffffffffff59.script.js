/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const projectId = api.context.props.projectId;
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
    api.setState('modelListFetchQuery', `sys_id=${projectId}`)
    api.setState('projectId', projectId);
}
