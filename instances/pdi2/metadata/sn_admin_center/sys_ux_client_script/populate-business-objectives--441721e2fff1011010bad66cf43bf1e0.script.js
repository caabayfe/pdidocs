/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const businessObjectives = api.data.get_business_objective_overview_data.output;
    let businessObjectivesData = [];
    for (let businessObjective of Object.keys(businessObjectives))
        businessObjectivesData.push(businessObjectives[businessObjective]);
    
    api.setState('business_objectives_data', businessObjectivesData);
}
