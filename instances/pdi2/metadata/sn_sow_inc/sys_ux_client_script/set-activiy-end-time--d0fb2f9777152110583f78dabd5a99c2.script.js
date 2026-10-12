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
    let endMsg = await helpers.translate('User approved on {0}. Remediation initiated.', api.data.sow_remediate_get_playbook_activity_context.output[0].sys_updated_on);
    api.setState('activityEndMsg', endMsg);
}
