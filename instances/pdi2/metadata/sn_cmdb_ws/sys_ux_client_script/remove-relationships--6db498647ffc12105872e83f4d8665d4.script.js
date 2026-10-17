/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        getRelRowDefinitions
    } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const {
        relationships,
        rowSelectionObj,
        selectedPage,
        pageSize
    } = api.state.relProps;

    let newRels = [];
    for (var i = 0; i < relationships.length; i++) {
        const rel = relationships[i];
        if (rowSelectionObj.hasOwnProperty(rel.key) && rowSelectionObj[rel.key]) {
            delete rowSelectionObj[rel.key];
        } else {
            newRels.push(rel);
        }
    }    
    let rows = getRelRowDefinitions(newRels, selectedPage, pageSize, rowSelectionObj);

    api.setState('relProps', {
        ...api.state.relProps,
        relationships: newRels,
        rowDefinitions: {
            rows
        },
        rowSelectionObj: {}
    });
}
