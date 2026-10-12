/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var ruleType = api.context.props.ruleType.toLowerCase();
  switch(ruleType) {
    case "one_time_delete":
      return helpers.translateSync("One time delete");
      break;
    case "table_cleaner":
      return helpers.translateSync("Table cleaner");
      break;
    case "archive":
      return helpers.translateSync("Archive");
      break;
  }
}
