/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var obj = {};
    var dropdownValue = api.state && api.state.modalDropdownValue && api.state.modalDropdownValue[0];
    if (dropdownValue == 'day') {
        obj.trendByFrequency = 'date';
    } else {
        obj.trendByFrequency = dropdownValue;
    }
    obj.trendByMinuteInterval = null;
    var trendByField = {};
    trendByField.field = 'date';
    trendByField.metric = 'c25fY2lfYW5hbHl0aWNzX3N0X2NvdW50X2J5X2RhdGVTVU0xNjM0NzQ5Nzkx';
    obj.trendByFields = [];
    obj.trendByFields.push(trendByField);
    return obj;
}
