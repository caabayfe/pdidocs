/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {

    let allTasks = api.data.get_all_tasks.results || [];

    if (api.data.get_setup_category_rest.output.result.isPluginCategory) {
        allTasks = allTasks.filter(task => task.task_type.value == 'advanced');
    }

    allTasks = allTasks.map(task => {
        return {
            "id": task.sys_id.value,
            "label": task.name.displayValue || '',
            "icon": task.status.value == 0 ? 'check-outline': 'none'
        };
    });

    if (allTasks.length === 0) {
        allTasks.push({
            "id": '-1',
            "label": 'New task',
            "icon": 'none'
        });
    }

    api.setState && api.setState('taskNames', allTasks);
    return;
}
