/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var fieldValueMap = api.state.fieldValueMap;
    if (event.name == "NOW_RECORD_FORM_SECTION_COLUMN_LAYOUT#SET_VALUE") {
        fieldValueMap[event.payload.fieldName].value = event.payload.value;
        fieldValueMap[event.payload.fieldName].displayValue = event.payload.displayValue;
        api.setState("fieldValueMap", JSON.parse(JSON.stringify(fieldValueMap)));
        var serializedChanges = api.state.serializedChanges;
        if (!serializedChanges)
            serializedChanges = [];
        else if (serializedChanges != "")
            serializedChanges = JSON.parse(serializedChanges);
        var serializedIndex = getObjIndex(serializedChanges, event.payload.fieldName);
        if (serializedIndex == -1) {
            serializedChanges.push(fieldValueMap[event.payload.fieldName]);
        } else {
            serializedChanges[serializedIndex] = fieldValueMap[event.payload.fieldName];
        }
        api.setState("serializedChanges", JSON.stringify(serializedChanges));
    }
    var formInvalid = false;
    for (var field in fieldValueMap) {
        if (fieldValueMap[field].visible && fieldValueMap[field].mandatory && (!fieldValueMap[field].value || fieldValueMap[field].value == "")) {
            formInvalid = true;
            api.setState("isFormInvalid", true);
            break;
        }
    }
    if (!formInvalid) {
        api.setState("isFormInvalid", false);
    }

    function getObjIndex(obj, element) {
        for (var index in obj) {
            if (obj[index].name == element)
                return index;
        }
        return -1;
    }
}
