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
    api.setState('myWorkLinks', {
        openTasks: {
            label: await helpers.translate('Open tasks'),
            filter: api.data.get_my_work_task_filter_1.output.open_task_filter
        },
        overdueTasks: {
            label: await helpers.translate('sn_cmdb_ws.overdueTasks.sentenceCase'),
            filter: api.data.get_my_work_task_filter_1.output.overdue_task_filter
        }
    });
}
