/**
 * Data broker to check if a subscription is App Engine V1 Subscription
 * @param {object} input - Contains subscriptionId as defined in properties.
 * @return {string}
 */
function transform(input) {
    try {
        const subscriptionId = input.subscriptionId;
        const subscriptions = global.AppEngineV1GlobalHelper.getAppEngineLicensesOnInstance();

        for (let subscription of subscriptions) {
            // Check if the subscription matches any AEv1 subscription sysId
            // and if the response is after SMv2 changes.
            if (subscription &&
                subscription.licenseSysId === subscriptionId &&
                subscription.supportsAppEngineV1 === true
            ) {
                return "true";
            }
        }
        return "false";
    } catch (error) {
        gs.error("Check App Engine V1 Subscription Data Broker failed : " + error);
        return "false";
    }
}
