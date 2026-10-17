/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var attrToRemove = event.context.item.value; //it is an object
    let dataMismatchClasses = api.state.dataMismatchClasses.map((x) => x);

    var currSelectedAttrArray = dataMismatchClasses[event.context.item.parent.index].attributes;

    //inside the attributes array, remove this obj
    var updatedAttrArray = currSelectedAttrArray.filter(e => e.id !== attrToRemove.id);

    //add the removed attr to attributes_list obj
    dataMismatchClasses[event.context.item.parent.index].attributes_list.push(attrToRemove);
    dataMismatchClasses[event.context.item.parent.index].attributes = updatedAttrArray;
    api.setState('dataMismatchClasses', dataMismatchClasses);   

    api.setState('isDirty',true);
}
