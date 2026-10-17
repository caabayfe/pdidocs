/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function script({api, event, helpers, imports}) {
    const { payload = {} } = event;
    const { status, sys_id } = payload;
    const { playbookCardProperties } = api.data.playbook_activity_ui;
    const { processDefinition, launcherInputs } = playbookCardProperties;

    if (status === "inserted") {
        if (launcherInputs) {
            api.setState("processDefinitionId", processDefinition);
            api.setState("parentRecord", sys_id);
            api.setState("input", launcherInputs, () => {
                api.data.launch_standalone_playbook.refresh();
            });
        }
        api.setState('insertedRecord', sys_id, () => {
            api.data.playbook_experience_trigger_playbook_if_not_running_mutation.refresh();
        });
    }
    
}
