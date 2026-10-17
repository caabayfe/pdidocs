/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let classData = JSON.parse(JSON.stringify(api.state.classData));
    let results = api.data.get_all_multisource_ci_classes_composite__rest.ciClassesWithSublabel;

    // Remove empty option
    if (results.all && results[0] && results[0].id === "")
        results.splice(0,1);

    // Sort Alphabetically
    results.sort((a, b) => (a.label > b.label) ? 1 : -1);

    // Set All
    classData.all = results.map((x) => x);

    api.setState('classData',classData);

    // Create Lookup Table for Classes. Allows finding a class by id.
    let classNameLookup = [];
    api.data.get_all_multisource_ci_classes_composite__rest.ciClassesWithSublabel.forEach(o => classNameLookup[o.id] = o.label);
    api.setState('classLookup', classNameLookup);
    
}
