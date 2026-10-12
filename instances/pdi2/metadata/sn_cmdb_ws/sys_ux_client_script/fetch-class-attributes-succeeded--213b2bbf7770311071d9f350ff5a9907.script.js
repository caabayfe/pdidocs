/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let result = event.payload.data.output.result;
    let allAttributes = [];

    for (let attribute of result) {
        allAttributes.push({
            'id': attribute.name,
            'label': attribute.label
        });
    }

    allAttributes.sort((a, b) => (a.label > b.label) ? 1 : -1);
    api.setState('allAttributes',allAttributes);

    let attributeNameLookup = [];
    allAttributes.forEach(o => attributeNameLookup[o.id] = o.label);
    api.setState('attributeLookup', attributeNameLookup);
    api.setState('totalAttributes',allAttributes.length);

}
