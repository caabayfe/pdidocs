/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        entityCardRepeaterData,
        idleTimeConfiguration: {
            projectActivityDefinitions
        },
        activitiesListSelectedRecords,
        projectIdleTimeEnabled
    } = api.state;
    if (api.state.showIdleTimeMetricsConfirmation && projectIdleTimeEnabled) {
        const processADs = projectActivityDefinitions.map(pad => pad.sysId);
        const matchedADs = [];
        const activityLabels = activitiesListSelectedRecords.map(item => {
            if (processADs.includes(item)) {
                const activity = entityCardRepeaterData[0].activities.find(i => i.id == item);
                if (activity) {
                    return matchedADs.push(activity.label);
                }
                return matchedADs.push(entityCardRepeaterData[0].activitiesOfInterest.find(i => i.id == item).label);
            }
        });
        return helpers.translateSync("Removing {0} will exclude Idle time metrics from project scope. Do you want to proceed?", matchedADs.join(", "));
    }
    return helpers.translateSync("This can't be reversed.");
}
