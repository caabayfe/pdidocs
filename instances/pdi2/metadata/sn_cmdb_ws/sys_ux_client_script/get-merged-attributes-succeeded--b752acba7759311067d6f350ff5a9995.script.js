/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    var allDeleteActionAttributes = [];
    var fieldInclusionList = [];
    let result = event.payload.data.output.result;
    result.forEach((item) => {
        fieldInclusionList.push(item.name);
        allDeleteActionAttributes.push({
            "id" : item.name,
            "label" : item.label,
            "type" : item.type,
            "max_length" : item.max_length,
            "choice_list" : item.choice_list,
            "reference" : item.reference
        });
    });
    allDeleteActionAttributes.sort((a, b) => (a.label > b.label) ? 1 : -1);

    // add attribute reference to delete actions
    let deleteActions = [...api.state.deleteActions];
    deleteActions.forEach((action) => { 
        action.attribute = allDeleteActionAttributes.find(obj => obj.id===action.element);
    });
    api.setState('deleteActions',deleteActions);

    api.setState('fieldInclusionList',fieldInclusionList);
    api.setState('allDeleteActionAttributes',allDeleteActionAttributes);
 
}
