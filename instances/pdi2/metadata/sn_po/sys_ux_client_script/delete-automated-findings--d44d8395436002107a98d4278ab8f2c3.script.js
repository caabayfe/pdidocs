/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        automated_finding_list
    } = api.state.selectedTemplateIds;

    if (automated_finding_list.length > 0) {
        api.data.delete_automated_findings.execute({
            table: 'promin_automated_finding',
            query: 'sys_idIN' + automated_finding_list.join(','),
        });
    }
}
