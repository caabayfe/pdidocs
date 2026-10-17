/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const funnelData = api.data && api.data.single_funnel_data && api.data.single_funnel_data.output;
    if (funnelData.error) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'invalid-id',
                status: 'critical',
                icon: 'circle-close-outline',
                content: funnelData.error,
                action: {
                    type: 'dismiss'
                }
            }]
        });
        helpers.timing.setTimeout(() => {
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: [{
                    id: "invalid-id"
                }]
            });
            const {
                startDate,
                endDate
            } = api.context.props;
            helpers.navigate.to('funnels', {}, {
                startDate,
                endDate,
                timestamp: Date.now()
            });
        }, 5000);
        return;
    }

    if (funnelData) {
        const {
            currentSteps,
            previousSteps
        } = funnelData;

        const currentPercentage = !currentSteps[0].enteredUsersCount ? 0 : (currentSteps[currentSteps.length - 1].completedUsers / currentSteps[0].enteredUsersCount) * 100;
        const previousPercentage = previousSteps[previousSteps.length - 1].overallCompletionRatio * 100;
        const percentageDiff = currentPercentage - previousPercentage;

        const enteredUsers = currentSteps[0].enteredUsersCount;
        const finishedUsers = currentSteps[currentSteps.length - 1].completedUsers;

        const currentNumUsersCompleted = currentSteps[currentSteps.length - 1].completedUsers;
        const previousNumUsersCompleted = previousSteps[previousSteps.length - 1].completedUsers;
        const usersDiff = currentNumUsersCompleted - previousNumUsersCompleted;
        const biggestObj = currentSteps && currentSteps.reduce((acc, step, index) => {
            const drop = !step.enteredUsersCount ? 0 : (((step.enteredUsersCount - step.completedUsers) / step.enteredUsersCount) * 100).toFixed(1);

            if (drop > acc.percentage) {
                return {
                    step: index + 1,
                    percentage: drop,
                    omitNextStep: index === currentSteps.length - 1 || index === currentSteps.length - 2
                };
            } else {
                return acc;
            }
        }, {
            step: 0,
            percentage: 0
        });

        api.setState('funnelData', {
            currentSteps,
            previousSteps,
            percentageDiff,
            currentPercentage,
            previousPercentage,
            enteredUsers,
            finishedUsers,
            biggestObj,
            usersDiff
        });

        api.setState('funnelName', funnelData.funnelName);

        const {
            getDaysDelta
        } = imports["sn_ci_analytics.dateUtils"]();
        const {
            startDate,
            endDate
        } = api.context.props;
        api.setState('daysDelta', getDaysDelta(startDate, endDate));
    }

}
