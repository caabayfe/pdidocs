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
    if (event.elementId == 'get_choice_sourceType') {
        api.data.check_external_data_enabled.refresh();
    } else {
        let projectStatusValues = api.data.get_choice_status.output.data.GlideChoiceColumn_Query.getChoiceFields;
        projectStatusValues = projectStatusValues.filter(type => type.displayValue != "(empty)").map(type => ({
            'id': type.rawValue,
            'label': type.displayValue
        }));

        if (api.context.props.projectId == -1) {
            projectStatusValues = projectStatusValues.filter(type => type.id == "DRAFT");
            api.setState('projectStatusInput', projectStatusValues);
        } else {
            api.setState('projectStatusInput', projectStatusValues);
        }
          api.data.is_shared_project.execute({
            projectId: api.context.props.projectId
        });
    } 
}
