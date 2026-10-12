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
        snHttp
    } = helpers;

    let stepAction = 'started';
    const {
        taskList,
        categoryId,
        groups,
        markAsComplete,
        taskId,
        taskStatus
    } = api.state;

    const isTableEvent = api.state.detailTask.configuration_types === "table";

    const isRecordSaveEvent = event.name === "SN_FORM_DATA_CONNECTED#FETCH_SUCCESS";
    if (isRecordSaveEvent) {
        const {
            enabled,
            canCreateGlobalTags
        } = event.payload.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideViewableTagQuery_Query.viewableRecordTags;
     
        if (!enabled && !canCreateGlobalTags)
            return;
    }

    const COMPLETED = "Completed";
    const IN_PROGRESS = "In Progress";
    const NOT_STARTED = "Not Started";
    const isFooterEvent = event.name === 'SN_HELP_SETUP_FOOTER#PRIMARY_CLICKED';

    const isPluginFooterEvent = isFooterEvent && api.state.detailTask.configuration_types === "install_plugin";
    if (isPluginFooterEvent) {
        return;
    }

    if (isFooterEvent && isTableEvent)
        return;

    const updateLog = (stepId, action, cb) => snHttp(`api/sn_ads_setup/play/log/setup/${api.context.props.setupId}/step/${stepId}`, {
            method: 'POST',
            batch: false,
            body: { 
                action,
                user_input : JSON.stringify({ 
                    hidePolarisHeader: api.context.props.hidePolarisHeader
                })
            }
        })
        .then(({
            response
        }) => {
            let newTaskList = taskList;
            const currentTaskIndex = taskList.findIndex(task => task.sys_id === stepId);

            if (action === 'completed') {
                newTaskList[currentTaskIndex].interactionStatus = COMPLETED;
                api.setState('taskList', newTaskList);
                api.setState('taskStatus', COMPLETED);
                helpers.modal.close('custom_1');
                api.setState('tableSysId', '');
            } else {
                newTaskList[currentTaskIndex].interactionStatus = IN_PROGRESS;
                api.setState('taskList', newTaskList);
            }
            if (cb) {
                cb();
            }
        })
        .catch(({
            error
        }) => {
            //TODO: Use common alert strategy
            const taskIndex = taskList.findIndex(task => task.sys_id === stepId);
            let newTaskList = taskList;
            if (action === 'completed')
                newTaskList[taskIndex].interactionStatus = IN_PROGRESS;
            else
                newTaskList[taskIndex].interactionStatus = NOT_STARTED;
            api.setState(taskList, newTaskList);
        });

    if (event.name === 'NOW_CONTENT_TREE#ITEM_CLICKED') {
        if (event.payload.item.status === COMPLETED || event.payload.item.status === IN_PROGRESS)
            return;
        updateLog(event.payload.item.id, stepAction);
    }

    if (isFooterEvent || isRecordSaveEvent) {
        stepAction = 'completed';
        const currentTaskIndex = taskList.findIndex(task => task.sys_id === taskId);
        //update status of current task
        if (taskStatus !== COMPLETED)
            updateLog(taskId, stepAction, () => {
                api.data.fetch_tasks_1.refresh();
                api.data.get_task_details_1.refresh();
            });

        if (currentTaskIndex + 1 >= taskList.length)
            return;

        //update status for next task
        if (!taskList[currentTaskIndex + 1].interactionStatus || taskList[currentTaskIndex + 1].interactionStatus === NOT_STARTED)
            updateLog(taskList[currentTaskIndex + 1].sys_id, 'started');

    }

    //Edit completed task
    if (event.name === 'NOW_BUTTON#CLICKED' && event.elementId === 'edit_button_1') {
        updateLog(taskId, 'started', () => {
            api.data.fetch_tasks_1.refresh();
            api.data.get_task_details_1.refresh();
        });
    }
}
