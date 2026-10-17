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
    var dropdownValue = api.state && api.state.dropdownValue && api.state.dropdownValue[0];
    if (dropdownValue == 'day') {
        obj.trendByFrequency = 'date';
    } else {
        obj.trendByFrequency = dropdownValue;
    }
    obj.trendByMinuteInterval = null;
    var trendByField = {};
    trendByField.field = 'date';
    trendByField.metric = 'c25fY2lfYW5hbHl0aWNzX3N0X2V2ZW50X3Byb3BlcnR5X3ZhbHVlX3RyZW5kU1VNMTYzNDc0OTc5MA==';
    obj.trendByFields = [];
    obj.trendByFields.push(trendByField);
    return obj;
}
