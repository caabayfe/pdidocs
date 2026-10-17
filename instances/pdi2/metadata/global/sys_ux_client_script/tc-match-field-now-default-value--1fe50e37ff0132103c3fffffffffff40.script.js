/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var options = api.data.rule_management_dmc.tableCleanerMatchfieldOptions;
  var selected = api.data.rule_management_dmc.ruleData.table_cleaner?.matchfield;
  if(options && selected) {
    var dropdownLabel = options.find(opt => opt["id"] == selected)?.label;
    if(dropdownLabel) return dropdownLabel;
    else return selected;
  } else {
    return selected;
  }
}
