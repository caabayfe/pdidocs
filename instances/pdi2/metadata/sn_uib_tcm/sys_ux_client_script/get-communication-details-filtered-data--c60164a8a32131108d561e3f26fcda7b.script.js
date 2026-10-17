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
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    const commPlanId = api.context.props.communicationPlanId;
    const filteredData = event.payload.controllerOutput;
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
    const playBookCardConstants = playBookCommunicationCardUtil.CONSTANTS;
    const pageHeadingMaxLength = playBookCardConstants.PAGE_HEADING_MAX_LENGTH;
    const inputTaskType = api.context.props.taskType;
    const communicationDetailsTaskFilterUtil = imports['sn_uib_tcm.CommunicationDetailsTaskFilterUtil']();
    const communicationDetailsTaskFilterUtilConstants = communicationDetailsTaskFilterUtil.CONSTANTS;
    const translatedMessages = api.state.translatedMessages;
    api.setState("activeTasks", []);
    api.setState("upcomingTasks", []);
    api.setState("overDueTasks", []);
    const {
        fetchICT,
        fetchDirectChat,
        fetchDirectCall
    } = api.state;
    let {
        directChats,
        directCalls,
        adhocICT
    } = api.state;

    if (!filteredData.status) {
        api.setState("dataFetchFailed", true);
        playBookCommunicationCardUtil.showControllerErrorMessagesAlerts(api, filteredData.error_messages);
        return;
    }
    if (filteredData.type === communicationDetailsTaskFilterUtilConstants.ICT_TASK_TYPE) {
        let activeICTTasks = [];
        if (commPlanId) {
            const commTasksByPlan = filteredData.ICT_DATA.commTasksByPlan;
            if (commTasksByPlan.length > 0 && commTasksByPlan[0].commPlanSysId === commPlanId) {
                let commPlanHeading = (commTasksByPlan[0].displayName.length < pageHeadingMaxLength) ?
                    commTasksByPlan[0].displayName : commTasksByPlan[0].displayName.substring(0, pageHeadingMaxLength) + "...";
                api.setState("pageHeading", commPlanHeading);
            }
        }
        if (filteredData.ICT_DATA.commTasksByState.length > 0) {
            const activeCalls = filteredData.ICT_DATA.activeCalls;
            const tasksMap = {
                [playBookCardConstants.OVERDUE]: "overDueTasks",
                [playBookCardConstants.UPCOMING]: "upcomingTasks",
                [playBookCardConstants.ACTIVE]: "activeTasks"
            };
            const commTasksByState = filteredData.ICT_DATA.commTasksByState;
            for (let j = 0; j < commTasksByState.length; j++) {
                let task = commTasksByState[j];
                let taskType = tasksMap[task.name];
                if (taskType) {
                    let playBookCommTasks = await playBookCommunicationCardUtil.getFieldsForPlayBookCommCard(api, helpers, task.comm_tasks, activeCalls);
                    if (inputTaskType && inputTaskType.toUpperCase() === communicationDetailsTaskFilterUtilConstants.FILTERS.PLAN_FILTERS.ADHOCTASKS && task.name.toUpperCase() === playBookCardConstants.ACTIVE.toUpperCase()) {
                        activeICTTasks = playBookCommTasks;
                    } else api.setState(taskType, [...playBookCommTasks]);
                }
            }
        }
        if (inputTaskType && inputTaskType.toUpperCase() === communicationDetailsTaskFilterUtilConstants.FILTERS.PLAN_FILTERS.ADHOCTASKS) {
            if (fetchDirectChat && fetchDirectCall) {
                let activeTasks = [];
                activeTasks = activeTasks.concat(directChats);
                activeTasks = activeTasks.concat(directCalls);
                activeTasks = activeTasks.concat(activeICTTasks);
                api.setState("activeTasks", [...activeTasks]);
                api.setState("pageLoaded", true);
            }
            api.setState('adhocICT', activeICTTasks);
            api.setState("fetchICT", true);
        } else api.setState("pageLoaded", true);
    }
    if (inputTaskType && inputTaskType.toUpperCase() === communicationDetailsTaskFilterUtilConstants.FILTERS.PLAN_FILTERS.ADHOCTASKS && filteredData.type === communicationDetailsTaskFilterUtilConstants.DIRECT_CHAT_DATA_TYPE &&
        filteredData[communicationDetailsTaskFilterUtilConstants.DIRECT_CHAT_DATA_TYPE]) {
        let directChat = filteredData[communicationDetailsTaskFilterUtilConstants.DIRECT_CHAT_DATA_TYPE].chat;
        directChat = playBookCommunicationCardUtil.buildPlaybookcardObjectForDirectChat(directChat, translatedMessages);
        api.setState('directChats', directChat);
        if (fetchICT && fetchDirectCall) {
            api.setState("pageLoaded", true);
            let activeTasks = [];
            activeTasks = activeTasks.concat(directChat);
            activeTasks = activeTasks.concat(directCalls);
            activeTasks = activeTasks.concat(adhocICT);
            api.setState("activeTasks", [...activeTasks]);
        }
        api.setState("fetchDirectChat", true);
    }
    if (inputTaskType && inputTaskType.toUpperCase() === communicationDetailsTaskFilterUtilConstants.FILTERS.PLAN_FILTERS.ADHOCTASKS && filteredData.type === communicationDetailsTaskFilterUtilConstants.DIRECT_CALL_DATA_TYPE &&
        filteredData[communicationDetailsTaskFilterUtilConstants.DIRECT_CALL_DATA_TYPE]) {
        let directCall = [];
        if (filteredData[communicationDetailsTaskFilterUtilConstants.DIRECT_CALL_DATA_TYPE].calls) {
            directCall = filteredData[communicationDetailsTaskFilterUtilConstants.DIRECT_CALL_DATA_TYPE].calls;
            directCall = playBookCommunicationCardUtil.buildPlaybookcardObjectForDirectCall(api, directCall, translatedMessages, NowDateTime);
        }
        api.setState('directCalls', directCall);
        if (fetchICT && fetchDirectChat) {
            api.setState("pageLoaded", true);
            let activeTasks = [];
            activeTasks = activeTasks.concat(directChats);
            activeTasks = activeTasks.concat(directCall);
            activeTasks = activeTasks.concat(adhocICT);
            api.setState("activeTasks", [...activeTasks]);
        }
        api.setState("fetchDirectCall", true);
    }
}
