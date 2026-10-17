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
    api.setState("hasError", false);
    var formInvalid = false;
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
    if (fieldValueMap.start_date != "" && fieldValueMap.end_date != "") {
        const {
            NowDateTime
        } = imports['sn_uxf.core_libraries']();
        var userFormat = api.context.session.user.dateTimeFormat.toUpperCase();
        var start = NowDateTime(fieldValueMap.start_date.value, userFormat);
        var end = NowDateTime(fieldValueMap.end_date.value, userFormat);
        if(start && end && end.isBefore(start)){
            api.setState("hasError", true);
            var errorMessage = await helpers.translate("Start date cannot be after end date.");
            api.setState("errorMessage", errorMessage);
            formInvalid = true;
        }
    }
    for (var field in fieldValueMap) {
        if (fieldValueMap[field].visible && fieldValueMap[field].mandatory && (!fieldValueMap[field].value || fieldValueMap[field].value == "")) {
            formInvalid = true;
            break;
        }
    }
    api.setState("isFormInvalid", formInvalid);
    function getObjIndex(obj, element) {
        for (var index in obj) {
            if (obj[index].name == element)
                return index;
        }
        return -1;
    }
}
