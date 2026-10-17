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
    const existingRecipients = api.data.get_recipients_for_comm_plan.output;
    if (!existingRecipients) return;
    api.setState("allSelectedRecipients", [...existingRecipients]);
    api.setState("existingRecipients", [...existingRecipients]);
}
