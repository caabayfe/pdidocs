/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const property_name = event.payload.eventPayload.content_block.props_details.property_name;
    const value = event.payload.eventPayload.actual_event.payload.value;

    const updatedConfig = {
        ...api.state.updated_configs,
        [property_name]: value   
    };

    api.setState('updated_configs', updatedConfig);
}
