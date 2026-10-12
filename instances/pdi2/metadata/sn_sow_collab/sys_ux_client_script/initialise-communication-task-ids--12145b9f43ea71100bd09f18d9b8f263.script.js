/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const controllerOutput = event.payload.controllerOutput;
    if (controllerOutput.type == "ICT_DATA") {
        let chatCommTaskIds = [];
        const commTasksByState = controllerOutput.ICT_DATA.commTasksByState;
        for (let index in commTasksByState) {
            if (commTasksByState[index].name != 'Active') continue;
            var commTasks = commTasksByState[index].comm_tasks;
            for (let index in commTasks) {
                if (commTasks[index].collabType == 'chat') chatCommTaskIds.push(commTasks[index].sys_id.value);
            }
        }
        api.setState('chatCommTaskIds', chatCommTaskIds);
    }
}
