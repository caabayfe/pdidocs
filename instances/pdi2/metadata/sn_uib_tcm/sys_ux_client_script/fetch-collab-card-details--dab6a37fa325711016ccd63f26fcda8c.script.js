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
    // Fetching the values for commTaskDetails from consuming/parent component
    let convertedCollabObject = api.context.props.collabTaskDetails;
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();

    if (convertedCollabObject) {
        if (convertedCollabObject.taskType != playBookCommunicationCardUtil.CONSTANTS.COLLABORATION) {
            return;
        }
        let isActive = false;
        if (convertedCollabObject.state.toLowerCase().startsWith("in progress")) {
            isActive = true;
        }
        const { state, due_date, short_description, description, commPlanDisplayName, status, communication_frequency, last_sent_time_ago, 
         channels, collapseAll, collabType, organizerName, activeCallTime, isDirectCall, isDirectChat, canClose, comm_count, permissions,canSnooze, commTaskType, task_sys_id, table, commPlanId, icon, serviceProvider, chatSysId, canInitiateSidebarDiscussion} = convertedCollabObject;
        api.setState("collabTaskDetails", { ...{
                state,
                due_date,
                short_description,
                description,
                commPlanDisplayName,
                status,
                communication_frequency,
                channels,
                collapseAll,
                collabType,
                isActive,
                organizerName,
                activeCallTime,
                isDirectCall,
                chatSysId,
                isDirectChat,
                canClose,
                comm_count,
                permissions,
                canSnooze,
                last_sent_time_ago,
                commTaskType,
                task_sys_id,
                table,                
                icon,
                canInitiateSidebarDiscussion,
                serviceProvider,
                "collabPlanID": commPlanId
            }
        });
        const overFlowMenuOptions = await playBookCommunicationCardUtil.overFlowMenuOptionsForCollabCards(helpers, convertedCollabObject);
        api.setState("overFlowMenuOptions", overFlowMenuOptions);
    }
}
