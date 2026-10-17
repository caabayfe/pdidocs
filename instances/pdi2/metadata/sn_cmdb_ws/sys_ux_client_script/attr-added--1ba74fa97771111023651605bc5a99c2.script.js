/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let dataMismatchClasses = api.state.dataMismatchClasses.map((x) => x);
    
    if(api.state.selectedAttr !== null) {
        //inside the attributes_list, find index of obj with key = api.state.selectedAttr, //save that obj
        var selectedAttrObj = dataMismatchClasses[event.context.item.index].attributes_list.find((e) => e.id === api.state.selectedAttr);
        dataMismatchClasses[event.context.item.index].attributes.push(selectedAttrObj); 

        //remove the new attributes from attributes_list array
        var updatedAttrList = dataMismatchClasses[event.context.item.index].attributes_list.filter(e => e.id !== api.state.selectedAttr);
        dataMismatchClasses[event.context.item.index].attributes_list = updatedAttrList;

        api.setState('dataMismatchClasses', dataMismatchClasses);   
        api.setState('isDirty',true); 
        //reset the selectedAttr back to null after adding to the attributes array
        api.setState('selectedAttr',null);
    }
     
}
