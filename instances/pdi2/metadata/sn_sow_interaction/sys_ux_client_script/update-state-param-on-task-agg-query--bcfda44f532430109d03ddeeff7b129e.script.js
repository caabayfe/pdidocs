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
    const userName = (api.data.lp_record.result && api.data.lp_record.result.first_name) ? api.data.lp_record.result.first_name.displayValue : "";
    const numberOfDays = (api.data.get_task_aggregation_query.output && api.data.get_task_aggregation_query.output.numberOfDays) ? api.data.get_task_aggregation_query.output.numberOfDays : "7";

    if (userName) {
        helpers.translate("{0}'s tasks", userName).then((val) => {
            api.setState('activeRecordsHeader', val);
        });
        helpers.translate("{0}'s assets", userName).then((val) => {
            api.setState('assetsHeader', val);
        });
        api.setState('hasRecentTasks', true);
        if (api.data.get_task_aggregation_query.output && api.data.get_task_aggregation_query.output.hasTasks) {
            if (numberOfDays == "1")
                helpers.translate('{0} has recent tasks created yesterday', userName, numberOfDays).then((val) => {
                    api.setState('responseString', val);
                });
            else
                helpers.translate('{0} has recent tasks created in last {1} days', userName, numberOfDays).then((val) => {
                    api.setState('responseString', val);
                });
        } else {
            helpers.translate('There are no recent tasks for {0}', userName).then((val) => {
                api.setState('responseString', val);
            });
            api.setState('hasRecentTasks', false);
        }
    }
}
