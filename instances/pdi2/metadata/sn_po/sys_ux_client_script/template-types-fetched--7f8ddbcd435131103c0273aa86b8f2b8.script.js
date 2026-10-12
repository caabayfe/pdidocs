/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const data = api.data.get_template_types.output.data.GlideChoiceColumn_Query.getChoiceFields;
    const projectTemplateDetails = {...api.state.projectTemplateDetails};
    const templateTypeListItems = [];
    for (let i = 1; i < data.length; i += 1) {
        templateTypeListItems.push({
            id: data[i].rawValue,
            label: data[i].displayValue,
        });
    }
    projectTemplateDetails.templateType.listItems = templateTypeListItems;
    api.setState('projectTemplateDetails', projectTemplateDetails);
}
