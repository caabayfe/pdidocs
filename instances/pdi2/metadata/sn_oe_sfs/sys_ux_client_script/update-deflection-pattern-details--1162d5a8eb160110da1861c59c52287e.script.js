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
   
    const {
        deflection_pattern_details
    } = api.state;
    
    const {
        elementId: cloumnName,
        payload: {
            value: newValue,
            fieldValue: name
        }
    } = event;
    
    deflection_pattern_details[cloumnName] = newValue;
    if(cloumnName == "name"){
        deflection_pattern_details[cloumnName] = name;
    }
    
    api.setState('deflection_pattern_details', deflection_pattern_details);
}
