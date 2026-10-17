/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let template = JSON.parse(JSON.stringify(api.state.template));
    let deleteActions = [...api.state.deleteActions];

    switch(event.elementId) {
    case 'name_input':
        template.name = event.payload.fieldValue;
        break;
    case 'description_input':
        template.description = event.payload.fieldValue;
        break;
    case 'delete_action_string_input':
    case 'delete_action_integer_input':
    case 'delete_action_float_input':
    case 'delete_action_decimal_input':
        deleteActions[event.context.item.index].value = event.payload.fieldValue;
        deleteActions[event.context.item.index].display = event.payload.fieldValue;
        break;
    }

    api.setState('deleteActions',deleteActions);
    api.setState('template',template);
    api.setState('isDirty', true);
}
