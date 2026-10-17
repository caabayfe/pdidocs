/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let template = JSON.parse(JSON.stringify(api.state.template));

    switch (event.elementId) {
        case 'allow_master_ci_null_update_checkbox':
            template.allow_master_ci_null_update = event.payload.value;
            break;
        case 'allow_null_attribute_update_checkbox':
            template.allow_null_attribute_update = event.payload.value;
            break;
        case 'automatically_select_all':
            api.setState('conditionMode', event.payload.value ? 1 : 0);
            break;
        case 'add_all_child_classes':
            api.setState('conditionMode', event.payload.value ? 2 : 1);
            break;
    }

    api.setState('template', template);
    api.setState('isDirty', true);
    
}
