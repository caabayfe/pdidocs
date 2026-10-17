/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const { payload = {} } = event;
    const { status, sys_id } = payload;

    if (status === "inserted") {
        api.setState('insertedRecord', sys_id);
        api.data.playbook_experience_trigger_playbook_if_not_running_mutation.refresh();
    }
}
