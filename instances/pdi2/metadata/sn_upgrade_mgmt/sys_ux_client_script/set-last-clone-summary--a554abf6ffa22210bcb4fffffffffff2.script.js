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
    const eventData = event.payload.data;

    // If a record got updated or deleted we ignore the event
    if (eventData.operation !== 'insert') {
        return;
    }

    api.setState("isCloneSummaryLoading", false);
    api.setState("isCloneSummaryError", false);

    const {record} = eventData;

    if (record.is_fetch_error.value === 'false') {
        let lastCloneSummary = {
            "cloneStartTime": record.start_time?.value,
            "endTime": record.end_time?.value,
            "finished": record.state?.value === "Completed" || record.state?.value === "Canceled",
            "state": record.state?.value,
            "sourceInstance": record.source_instance?.value,
            "targetInstance": record.target_instance?.value
        }
        if(lastCloneSummary.state !== "No clone has been scheduled for this instance"){
            api.data.getlastclonesummary_1.refresh();
            api.setState("isCloneSummaryLoading", true);
        }
        api.setState("lastCloneSummary", lastCloneSummary);
        api.setState('hideCloneDetails', lastCloneSummary.state === "No clone has been scheduled for this instance");

        lastCloneSummary.finished === true
        if (lastCloneSummary.finished === true){
            api.setState("disableComplete", false);
        } else if (lastCloneSummary?.state?.trim().toLowerCase() === "no clone has been scheduled for this instance") {
            api.setState("disableComplete", false);
        } else if ((lastCloneSummary?.state?.trim().toLowerCase().indexOf('fail') !== -1) || (lastCloneSummary?.state?.trim().toLowerCase().indexOf('error') !== -1)) {
            api.setState("disableComplete", false);
        }
        else {
            //Clone is in progress so Skip & Mark as complete should be disabled.
            api.setState("disableComplete", true);
        }
    } else {
        api.setState("isCloneSummaryError", true);
        api.setState("disableComplete", false);
    }

    // Set last refresh time for "Last refreshed..." display
    var lastRefreshTime = new Date().toISOString();
    api.setState("cloneSummaryLastRefreshTime", lastRefreshTime);
    api.setState("cloneSummaryNow", lastRefreshTime);
    
    // Update the "now" time every 60 seconds to refresh the time difference
    helpers.timing.setInterval(function() {
        api.setState("cloneSummaryNow", new Date().toISOString());
    }, 60000);
}
