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

    const overviewIcons = {
        expand: 'chevron-up-outline',
        collapse: 'chevron-down-outline'
    };

    const toggleSummary = async (collapseAll) => {
        const icon = collapseAll ? overviewIcons.collapse : overviewIcons.expand;
        const iconLabel = collapseAll ? await helpers.translate("Expand card") : await helpers.translate("Collapse card");
        let obj = {
            ...api.state.expandData,
            icon: icon,
            label: iconLabel,
            expanded: !collapseAll
        };
        api.setState('expandData', {...obj});
    };
    // Fetching the values for commTaskDetails from consuming/parent component
    let convertedCommObject = api.context.props.commTaskDetails;
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
    if (convertedCommObject) {
        if (convertedCommObject.taskType != playBookCommunicationCardUtil.CONSTANTS.COMMUNICATION) {
            return;
        }
        if(convertedCommObject.last_sent){
            const timeZone = api.context.session.user.timeZone;
            let duration = NowDateTime().tz("UTC").valueOf() - playBookCommunicationCardUtil.getNowDateTime(NowDateTime,convertedCommObject.last_sent, null, timeZone, "UTC").valueOf();
            let lastSent = await playBookCommunicationCardUtil.convertDurationIntoTime(helpers,duration);
            api.setState("lastSent", lastSent);
        }
        const { state, due_date, short_description, description, commPlanDisplayName, status, communication_frequency, last_sent, last_sent_time_ago, 
         channels, collapseAll, commPlanId, canClose, comm_count, permissions, canStart, canSnooze, task_sys_id, table, commTaskType,ictNumber,commTaskTable,canSendUpdates} = convertedCommObject;
        api.setState("commTaskDetails", { ...{
                state,
                due_date,
                short_description,
                description,
                commPlanDisplayName,
                status,
                communication_frequency,
                last_sent,
                last_sent_time_ago,
                channels,
                collapseAll,
                commPlanId,
                canClose,
                comm_count,
                permissions,
                canStart,
                canSnooze,
                task_sys_id,
                table,
                commTaskType,
                ictNumber,
                commTaskTable,
                canSendUpdates
            }
        });
        toggleSummary(convertedCommObject.collapseAll);
        const overFlowMenuOptions = await playBookCommunicationCardUtil.overFlowMenuOptionsForCommunicationCards(helpers,convertedCommObject);
        api.setState("overFlowMenuOptions", overFlowMenuOptions); 
    }
}
