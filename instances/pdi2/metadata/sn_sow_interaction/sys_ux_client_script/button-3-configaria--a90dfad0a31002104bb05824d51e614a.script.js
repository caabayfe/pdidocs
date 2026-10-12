/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const viewAllTasks = helpers.translateSync('View All Tasks');

    const firstName = api.data.lp_record.result.first_name.displayValue;

    const ariaLabel = firstName ? helpers.translateSync("View all of {0}'s tasks", firstName) : viewAllTasks;

    return { 
        "aria-label": ariaLabel
    };
}
