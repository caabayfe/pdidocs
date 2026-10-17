function handler({
    api,
    event
}) {
    let isValidCategory = api.data.get_setup_category_rest.output.result.error ? false : true;
    let isValidSetup = api.data.get_setup_info.items ? api.data.get_setup_info.items.length > 0 : false;
    let isNewCategory = api.context.props.categoryId === '-1' ? true : false;
    let isNewTask = api.context.props.taskId === '-1' ? true : false;
    let isValidTask = api.data.get_task_info.items ? (!isNewTask && api.data.get_task_info.items.length > 0) : false;
    let canShowTask = api.context.props.taskId && api.context.props.taskId !== "";

    if (!isValidSetup) {
        api.setState('hideRecordNotFound', false); // Show "Record not found"
    } else if (isNewCategory) {
        api.setState('hideRecordNotFound', true); // Hide "Record not found"
    } else if (!isValidCategory) {
        api.setState('hideRecordNotFound', false); // Show "Record not found"
    } else if (isNewTask) {
        api.setState('currentTaskId', [['-1']]);
        api.setState('taskView', true);
    } else if (canShowTask) {
        api.setState('currentTaskId', [[api.context.props.taskId]]);
        api.setState('taskView', true);
    } else {
        api.setState('taskView', false);
        api.setState('currentTaskId', [[]]);
    }
    return;
}
