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
    var formInvalid = false;
    if (event.payload && event.payload.data && event.payload.data.changes) {
        var changes = event.payload.data.changes;
        var fieldValueMap = api.state.fieldValueMap;
        var serializedChanges = api.state.serializedChanges;
        if (!serializedChanges)
            serializedChanges = [];
        else if (serializedChanges != "")
            serializedChanges = JSON.parse(serializedChanges);
        if (changes.includes("start_date")) {
            fieldValueMap.start_date.value = event.payload.data.record.start_date.display_value;
            fieldValueMap.start_date.displayValue = event.payload.data.record.start_date.display_value;
            serializedChanges = serializeChanges(serializedChanges, fieldValueMap, "start_date");
        }
        if (changes.includes("end_date")) {
            fieldValueMap.end_date.value = event.payload.data.record.end_date.display_value;
            fieldValueMap.end_date.displayValue = event.payload.data.record.end_date.display_value;
            serializedChanges = serializeChanges(serializedChanges, fieldValueMap, "end_date");
        }
        var labelValueLoad = [];
        for (var field in fieldValueMap) {
            var item = {};
            if (fieldValueMap[field].visible) {
                item.label = fieldValueMap[field].label;
                item.value = {};
                item.value.type = "string";
                item.value.value = fieldValueMap[field].value;
                labelValueLoad.push(item);
            }
        }
        api.setState("labelValueLoad", labelValueLoad);
        api.setState("fieldValueMap", JSON.parse(JSON.stringify(fieldValueMap)));
        api.setState("serializedChanges", JSON.stringify(serializedChanges));
    }
    if (fieldValueMap.start_date != "" && fieldValueMap.end_date != "") {
        const {
            NowDateTime
        } = imports['sn_uxf.core_libraries']();
        var userFormat = api.context.session.user.dateTimeFormat.toUpperCase();
        var start = NowDateTime(fieldValueMap.start_date.value, userFormat);
        var end = NowDateTime(fieldValueMap.end_date.value, userFormat);
        if (start && end && end.isBefore(start)) {
            api.setState("hasError", true);
            var errorMessage = await helpers.translate("Start date cannot be after end date.");
            api.setState("errorMessage", errorMessage);
            formInvalid = true;
        }
    }
    for (var field in fieldValueMap) {
        if (fieldValueMap[field].visible && fieldValueMap[field].mandatory && !fieldValueMap[field].value) {
            formInvalid = true;
            break;
        }
    }
    api.setState("isFormInvalid", formInvalid);

    function serializeChanges(serializedChanges, fieldValueMap, fieldName) {
        var serializedIndex = getObjIndex(serializedChanges, fieldName);
        if (serializedIndex == -1) {
            serializedChanges.push(fieldValueMap[fieldName]);
        } else {
            serializedChanges[serializedIndex] = fieldValueMap[fieldName];
        }
        return serializedChanges;
    }

    function getObjIndex(obj, element) {
        for (var index in obj) {
            if (obj[index].name == element)
                return index;
        }
        return -1;
    }
}
