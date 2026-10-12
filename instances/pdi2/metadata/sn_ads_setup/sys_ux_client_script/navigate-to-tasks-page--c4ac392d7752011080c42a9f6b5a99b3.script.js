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
    const playbookResponse = api.data.playbook_data_broker_1;
    const contextIds = playbookResponse && playbookResponse.playbookContextIdsInOrder || [];
    const selectedPlaybook = contextIds[contextIds.length - 1];
    const selectedStage = event.payload.groupId;
    let selectedActivity = event.payload.taskId;

    if (!selectedActivity) {
        const statusMap = {
            'COMPLETE': 'Completed',
            'NOT_STARTED': 'Not Started',
            'IN_PROGRESS': 'In Progress',
            'PENDING': 'Pending'
        };
        const lanes = playbookResponse.playbooksByContextId[selectedPlaybook].lanes;
        const lane = lanes.filter(l => l.contextId === selectedStage)[0];
        const tasks = lane.cards.filter(task => task.show);
        const notStartedTasks = tasks.filter(task => task.state.displayValue === statusMap.IN_PROGRESS || task.state.displayValue === statusMap.PENDING);
        if (notStartedTasks.length) {
            selectedActivity = notStartedTasks[0].contextId;
        } else {
            selectedActivity = tasks[0].contextId;
        }
    }

    const timestamp = new Date().getTime();
    helpers.navigate.to("tasks", {
        "setupId": api.context.props.sysId
    }, {
        "interactionId": api.context.props.interactionId,
        "customId": timestamp,
        "selectedPlaybook": selectedPlaybook,
        "selectedStage": selectedStage,
        "selectedActivity": selectedActivity
    });

}
