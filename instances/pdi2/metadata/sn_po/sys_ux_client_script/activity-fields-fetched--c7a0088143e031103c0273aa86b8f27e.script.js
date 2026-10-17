/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const fields = api.data.get_activity_fields.output.data.snPo.GlidePromin.prominAllowedColumnList.fields;
    const listItems = [];
    for (const field of fields) {
        listItems.push({
            id: field.name,
            label: field.label,
            internalType: field.internalType
        });
    }
    let activityForm = {...api.state.activityForm};
    activityForm.fields.relation.listItems = listItems;
    api.setState('activityForm', activityForm);
}
