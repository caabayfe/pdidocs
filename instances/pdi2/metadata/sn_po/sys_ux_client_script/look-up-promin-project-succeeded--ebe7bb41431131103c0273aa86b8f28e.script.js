/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.context.props.projectId === "-1") {
        return;
    }
    const prominProject = api.data.look_up_promin_project.result;
    api.setState("restricted", prominProject.restricted.value);
    const autoRetire = { ...api.state.autoRetire, value: prominProject.auto_retire.value };
    api.setState("autoRetire", autoRetire);
    api.setState("is_le_progress", prominProject.is_le_progress.value);
    if (!prominProject.is_template) {
        return;
    }
    if (prominProject.is_template.value) {
    const autoRetire = { ...api.state.autoRetire, visible: true };
    api.setState("autoRetire", autoRetire);;
    }
    const projectTemplateDetails = {...api.state.projectTemplateDetails};
    projectTemplateDetails.isTemplate = prominProject.is_template.value;
    projectTemplateDetails.templateType.selectedValue = prominProject.template_type.value;
    api.setState('originalTemplateType', prominProject.template_type.value);
    api.setState('projectTemplateDetails', projectTemplateDetails);
}
