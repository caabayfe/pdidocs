/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { updateContinueButtonState } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    
    let {
        table,
        fieldsArr
    } = event.context.item.parent.value;

    let {
        tableFields,
        userPayload
    } = api.state;
    //find table in tableFields.
    var tableFieldIdx = event.context.item.parent.index;
    var currIndex = event.context.item.index;

    //update fieldsArr and add a new entry
    tableFields[tableFieldIdx].fieldsArr.splice(currIndex, 1);
    api.setState("tableFields", JSON.parse(JSON.stringify(tableFields)));

    //also remove from userPayload
    if(userPayload.attributes.hasOwnProperty(table)) {
        if(userPayload.attributes[table].fields.length > currIndex) {
            //there are values in userPayload that need to be removed
            userPayload.attributes[table].fields.splice(currIndex, 1);
            var updatedUserPayload = JSON.parse(JSON.stringify(userPayload));
            api.setState("userPayload", updatedUserPayload);
        }
    }
    updateContinueButtonState(updatedUserPayload);
}
