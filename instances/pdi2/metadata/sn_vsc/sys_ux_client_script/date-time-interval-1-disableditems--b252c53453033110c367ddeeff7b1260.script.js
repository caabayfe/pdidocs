/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var disabledItems = [];
  disabledItems.push({ before : api.state.oldestComparisonDate });
  if (api.state.disabledDatesForDatePicker) {
    var specificDisabledDates = api.state.disabledDatesForDatePicker.map(function(item) {
      return { start: item, end: item };
    });
    disabledItems = disabledItems.concat(specificDisabledDates);
  }
  disabledItems.push({ after: api.state.newestComparisonDate });
  return disabledItems;
}
