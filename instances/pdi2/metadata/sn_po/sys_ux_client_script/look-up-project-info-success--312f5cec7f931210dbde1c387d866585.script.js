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
    if (api.data.look_up_project_info.items?.length == 0) {
        return;
    }

    const name = api.data.look_up_project_info.result.name.displayValue;

    const automatedFindingForm = { ...api.state.automatedFindingForm };

    automatedFindingForm.name = {};
    automatedFindingForm.name.value = name;
    automatedFindingForm.name.applyToSource = 'project';
    automatedFindingForm.name.sys_id = api.context.props.projectId;
    automatedFindingForm.name.readOnly = true;

    api.setState('automatedFindingForm', automatedFindingForm);
}
