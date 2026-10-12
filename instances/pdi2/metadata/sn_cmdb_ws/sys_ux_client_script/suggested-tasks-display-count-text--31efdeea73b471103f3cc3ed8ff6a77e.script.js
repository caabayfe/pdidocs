/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var count = 0;
  var total = 0;
  var tasks = api.state.suggestedMatchesTasks;

  if (tasks.length > 10) {
    count = 10;
    total = tasks.length;
  } else {
    count = tasks.length;
    total = tasks.length;
  }

	return helpers.translateSync('Showing {0} out of {1} tasks', count, total);
}
