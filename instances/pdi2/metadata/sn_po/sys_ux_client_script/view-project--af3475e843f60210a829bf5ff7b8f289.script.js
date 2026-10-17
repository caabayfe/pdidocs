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
        Findings: findings
    } = api.data.fetch_promin_findings_1.output.data.GlidePromin_Query;
    if (api.state.isPlaybookSourceTypeProject) {
        helpers.navigate.to('process-details', {
            versionId: api.state.projectData.versionId,
        }, {
            selectedTab: 'playbook_workbench'
        }, true);
    } else {
        helpers.navigate.to('process-details', {
            versionId: api.state.projectData.versionId,
        }, {
            selectedTab: findings && findings.length > 0 ? 'summary_and_insights' : 'analyst_workbench'
        }, true);
    }
}
