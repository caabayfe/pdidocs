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
    const {
        tasks
    } = api.state;
    const updatedTasks = JSON.parse(JSON.stringify(tasks));
    let loaderText = '';

    const {
        task: completedTask,
        subTask
    } = event.payload;

    Object.entries(updatedTasks).forEach(([task, status]) => {
        if (task === completedTask) {
            status.completed = true;
            loaderText = status.text;
        }
    });

    api.setState('tasks', updatedTasks);
    api.setState('loaderText', loaderText);
}
