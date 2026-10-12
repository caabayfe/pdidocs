/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const {
        def_config_details
    } = api.state;

    const {
        elementId: cloumnName,
        payload: {
            fieldValue: newValue,
        }
    } = event;
    
    def_config_details[cloumnName] = newValue;
    
    api.setState('def_config_details', def_config_details);
}
