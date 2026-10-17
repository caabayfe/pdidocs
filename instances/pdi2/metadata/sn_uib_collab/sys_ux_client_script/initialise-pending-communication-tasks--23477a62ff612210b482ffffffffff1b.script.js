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
    const validStates = ['Upcoming', 'Overdue'];
    const controllerOutput = event.payload.controllerOutput;

    const extractIds = (recipients) => {
        if (!recipients) return [];
        return recipients.map(obj => {
            switch (obj.type.value) {
                case 'sys_user':
                    return obj.user.value;
                case 'sys_user_group':
                    return obj.group.value;
                case 'sn_publications_recipients_list':
                    return obj.recipient_list.value;
                default:
                    return '';
            }
        }).filter(id => id.length > 0);
    };

    if (controllerOutput.type == "ICT_DATA") {
        let commTasks = [];
        const commTasksByState = controllerOutput.ICT_DATA.commTasksByState;
        for (let index in commTasksByState) {
            if (!validStates.includes(commTasksByState[index].name)) continue;
            commTasks = commTasks.concat(commTasksByState[index].comm_tasks);
        }

        const recipientsMap = controllerOutput.ICT_DATA.comm_plan.reduce((acc, obj) => {
            acc[obj.sys_id.value] = extractIds(obj.recipients);
            return acc;
        }, {});
        commTasks = commTasks.map(obj => ({ ...obj,
            recipients: recipientsMap[obj.commPlanSysId].join(',')
        }));
        api.setState('pendingCommTasks', commTasks);
    }
}
