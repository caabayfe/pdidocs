/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const db = api.data.playbook_data_broker_1;
    const contextIds = db && db.playbookContextIdsInOrder || [];
    if (contextIds.length === 0) return [];
    const latestContext = db && db.playbookContextIdsInOrder[contextIds.length - 1];
    const processData = db && db.playbooksByContextId[latestContext];
    if (!processData) return [];

    let lanes = processData.lanes.filter(l => l.cards.length);

    const statusMap = {
        // TODO: translate with await helpers.translate
        'COMPLETE': 'completed',
        'NOT_STARTED': 'notStarted',
        'IN_PROGRESS': 'inProgress',
        'PENDING': 'pending',
        'READY': 'ready'
    };

    lanes = lanes.map(lane => {
        let tasks = lane.cards.filter(task => task.show);
        const notStartedTasks = tasks.filter(task => [statusMap.IN_PROGRESS, statusMap.PENDING, statusMap.READY].includes(statusMap[task.state.value]));
        const hasNoTaskStarted = notStartedTasks.length === tasks.length;
        let categoryStatus = statusMap[lane.state.value];

        if (hasNoTaskStarted) categoryStatus = statusMap.NOT_STARTED;

        tasks = tasks.map(task => {
            return {
                "name": task.title,
                "description": task.description || "",
                "status": statusMap[task.state.value],
                "sys_id": task.contextId,
                "isLocked": task.state.value === "PENDING"
            };
        });

        return {
            "name": lane.title,
            "description": lane.description || "",
            "status": categoryStatus,
            "sys_id": lane.contextId,
            "isLocked": lane.state.value === "PENDING",
            "tasks": tasks
        };
    });

    return lanes;
}
