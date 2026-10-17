/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const isOOBPolicy = api?.state?.isOOBPolicy;
    if (isOOBPolicy == true) {
        return "green";
    } else {
        const conditionsOnTheUi = api?.state?.conditionsOnTheUI;
        // If at least one condition is added, regardless of the value empty/non-empty
        for ( const condition of conditionsOnTheUi) {
            if(condition.displayOff == false) return "green";
        }
        return "critical";
    }
}
