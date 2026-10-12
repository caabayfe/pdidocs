/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let results = api.data.multisource_get_attributes.output;
    let attributeData = JSON.parse(JSON.stringify(api.state.attributeData));

    // Remove empty option
    if (results && results[0] && results[0].id === "")
        results.splice(0,1);

    // Sort Alphabetically
    if(results !== null) {
        results.sort((a, b) => (a.label > b.label) ? 1 : -1);

        // Set All
        attributeData.all = results.map((x) => x);

        api.setState('attributeData',attributeData);

        // Create Lookup Table for Classes. Allows finding a class by id.
        let attributeNameLookup = [];
        attributeData.all.forEach(o => attributeNameLookup[o.id] = o.label);
        api.setState('attributeLookup', attributeNameLookup);
    }
    

}
