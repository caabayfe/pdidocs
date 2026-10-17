/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({
    api,
    event,
    helpers,
    imports
}) {

    const {
        props: {
            currentValue,
            fieldType,
            referenceField,
            displayValue,
            displayValueList
        }
    } = api.context;
    let {
        selectedItems
    } = api.state;
    if(selectedItems === null){
        selectedItems = [];
    }
    const newValue = selectedItems.map(item => item[0].id).join(",");
    const newDisplayValue = selectedItems.map(item => item[0].label);

    let constructedDisplayValue;
    if (displayValueList)
        constructedDisplayValue = [...displayValueList, ...newDisplayValue];
    else
        constructedDisplayValue = displayValue ? [...displayValue.split(','), ...newDisplayValue] : [...newDisplayValue];

    const payload = {
        "referenceField": referenceField,
        "value": newValue,
        "displayValue": {
            "value": [...newDisplayValue]
        }
    };

    api.emit("MULTIPLE_RECORDS_SELECTED", payload);
    api.emit("MODAL_SELECTED", {
        showModal: false,
        options: {}
    });
}
