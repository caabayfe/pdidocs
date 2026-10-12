/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let results = event.payload.data.output.result;
    let attributeLookup = [];
    results.forEach((attribute) => {
        attributeLookup[attribute.name] = attribute.label;
    });
    api.setState('attributeLookup',attributeLookup);
    api.setState('totalAttributes',Object.keys(attributeLookup).length);

}
