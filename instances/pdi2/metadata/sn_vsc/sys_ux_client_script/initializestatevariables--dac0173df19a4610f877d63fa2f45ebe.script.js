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

    let existingConditions = api?.data?.get_policy_conditions_sysids_and_types?.output?.conditions_for_ui;
    let allEligibleConditions = api?.data?.get_eligible_conditions_for_the_security_policy?.output?.conditions;
    let newConditionsForUI = [];

    if (existingConditions || allEligibleConditions) {
        if (!existingConditions.length) {
            // If no condition has been associated so far to a policy
            newConditionsForUI = allEligibleConditions;
        } else if (existingConditions.length == allEligibleConditions.length){
            // If all the eligible conditions are already attached with the policy
            newConditionsForUI = existingConditions;
        } else {
            // Assign all the existing conditions right away for the UI
            newConditionsForUI = existingConditions;
            // Extract all the remaining conditions from the available ( non-existing ) conditions
            for (var i = 0; i < allEligibleConditions.length; i++) {
                var eligibleCondition = allEligibleConditions[i];
                var eligibleConditionModelId = eligibleCondition.model_id;
                if (!searchWithinArray(newConditionsForUI, eligibleConditionModelId)) {
                    newConditionsForUI.push(eligibleCondition);
                }
            }
        }

        // "newConditionsForUI" will hold existing + non-existing conditions.
        api.setState("conditionsOnTheUI", newConditionsForUI);

        // Prepare the condition modal dropdown
        let newConditionsForModalDropDown = [];
        const existingConditionsOfPolicyIds = api?.data?.get_policy_conditions_sysids_and_types?.output?.existingConditionsOfPolicyIds;
        // If there are no existing conditions, modal dropdown should show all the eligible conditions
        if (!existingConditionsOfPolicyIds.length) {
            newConditionsForModalDropDown = allEligibleConditions;
        } else if (allEligibleConditions.length) {
            // If there are few exisiting conditions for the policy, then modal dropdown should only show which are not yet applied to the policy
            for (const availableCondition of allEligibleConditions) {
                const conditionId = availableCondition["id"];
                // Update modal dropdown with all the conditions which are not yet attached to the policy
                if (existingConditionsOfPolicyIds.indexOf(conditionId) < 0) {
                    newConditionsForModalDropDown.push(availableCondition);
                }
            }
        }

        api.setState("conditionsForModalDropDown", newConditionsForModalDropDown);
    }

    function searchWithinArray(array, model_id_to_search) {
        var isFound = false;
        isFound = array.find((savedCondition, i) => {
            if (savedCondition.model_id == model_id_to_search) {
                return true; 
            }
        });
        return isFound;
    }

}
