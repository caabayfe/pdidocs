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
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
    const translatedMessages = await playBookCommunicationCardUtil.getTranslatedMessages(helpers);
    const collapseAll = translatedMessages.collapseAll;
    const expandAll = translatedMessages.expandAll;
    const setLabelsAndCommTaskData = (label, labelValue, commTasks, collapseFlag, tasks, lastRefreshVariable, lastRefreshValue) => {
        api.setState(label, labelValue);
        commTasks.forEach((task) => {
            task.collapseAll = collapseFlag;
        });
        api.setState(tasks, [...commTasks]);
        api.setState(lastRefreshVariable, lastRefreshValue);
    };
    if (event.elementId === 'overdue_button_label') {
        let commTasks = api.state.overDueTasks;
        let overDueLabel = api.state.overDueLabel;
        if (overDueLabel === collapseAll) {
            setLabelsAndCommTaskData("overDueLabel", expandAll, commTasks, true, "overDueTasks", "lastRefreshedOverDue", Date.now());
        } else {
            setLabelsAndCommTaskData("overDueLabel", collapseAll, commTasks, false, "overDueTasks", "lastRefreshedOverDue", -1);
        }
    } else if (event.elementId === 'upcoming_button_label') {
        let commTasks = api.state.upcomingTasks;
        let upcomingLabel = api.state.upcomingLabel;
        if (upcomingLabel === collapseAll) {
            setLabelsAndCommTaskData("upcomingLabel", expandAll, commTasks, true, "upcomingTasks", "lastRefreshedUpcoming", Date.now());
        } else {
            setLabelsAndCommTaskData("upcomingLabel", collapseAll, commTasks, false, "upcomingTasks", "lastRefreshedUpcoming", -1);
        }
    } else {
        let commTasks = api.state.activeTasks;
        let upcomingLabel = api.state.activeLabel;
        if (upcomingLabel === collapseAll) {
            setLabelsAndCommTaskData("activeLabel", expandAll, commTasks, true, "activeTasks", "lastRefreshedActive", Date.now());
        } else {
            setLabelsAndCommTaskData("activeLabel", collapseAll, commTasks, false, "activeTasks", "lastRefreshedActive", -1);
        }
    }
}
