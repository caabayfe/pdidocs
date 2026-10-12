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
        case 'merge_relationship_radio_buttons':
            template.merge_relations = event.payload.value;
            break;
        case 'duplicate_ci_radio_buttons':
            template.duplicate_ci_action = event.payload.value;
            break;
        case 'merge_related_items_radio_buttons':
            template.merge_related_items = event.payload.value;
            break;
    }

    api.setState('template', template);
    api.setState('isDirty', true);
}
