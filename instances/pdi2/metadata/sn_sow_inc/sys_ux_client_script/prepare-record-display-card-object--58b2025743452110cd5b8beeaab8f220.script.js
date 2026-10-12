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
    var record = api.data.target_record.output.data.GlideRecord_Query[api.state.targetTable]._results[0];
    var responseFields = api.state.targetRecordFields;
    responseFields = responseFields.split(",");
    var labelValueLoad = [];
    for (var field in responseFields) {
        var element = record[responseFields[field]];
        var item = {};
        item.label = element.label;
        if (responseFields[field] == "number") {
            item.value = {};
            item.value.type = "text-link";
            item.value.label = element.displayValue;
            item.value.underlined = true;
            item.value.href = "javascript:void(0);";
        } else {
            item.value = {};
            item.value.type = "string";
            item.value.value = element.displayValue;
        }
        if (element.value)
            labelValueLoad.push(item);
    }
    api.setState("labelValueItems", labelValueLoad);
}
