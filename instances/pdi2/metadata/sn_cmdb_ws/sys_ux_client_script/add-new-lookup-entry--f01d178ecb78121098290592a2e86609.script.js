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
    var newFieldsObj = fieldsArr[0];

    //update fieldsArr and add a new entry
    tableFields[tableFieldIdx].fieldsArr.push(newFieldsObj);

    let currentLength = userPayload.attributes[table].fields.length;
    userPayload.attributes[table].fields.push({});
    fieldsArr[0].fields.forEach((field) => {
        userPayload.attributes[table].fields[currentLength][field.element] = { 
            'label' : field.label, 
            'value' : field.defaultValue, 
            'displayValue' : field.defaultValueLabel,
            'mandatory': field.mandatory
        };
    });

    api.setState("tableFields", JSON.parse(JSON.stringify(tableFields)));
    api.setState("userPayload", userPayload);

    updateContinueButtonState(userPayload);
}
