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
    const {
        rule_based_finding_list
    } = api.state.selectedTemplateIds;

    if (rule_based_finding_list.length > 0) {
        api.data.delete_findings.execute({
            table: 'promin_finding_def',
            query: 'sys_idIN' + rule_based_finding_list.join(','),
        });
    }
}
