/**
 * @param {params} params 
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    const filters = api.state.filters;
    const communicationDetailsTaskFilterUtil = imports["sn_uib_tcm.CommunicationDetailsTaskFilterUtil"]();
    const controllerConstants = communicationDetailsTaskFilterUtil.CONSTANTS;
    const translatedMessages = await communicationDetailsTaskFilterUtil.getTranslatedMessages(helpers);
    let controllerOutput = communicationDetailsTaskFilterUtil.getOutputTemplate(); // Controller output object
    controllerOutput.type = controllerConstants.ICT_TASK_TYPE; // Assigning task type as ICT_DATA in output of controller
    const planFilters = controllerConstants.FILTERS.PLAN_FILTERS;
    const planFilterValues = Object.keys(planFilters).map(function(key) {
        return planFilters[key];
    });

    // Inputs
    let inputCommPlanIds = [],
        inputPlanFilters = [];
    if (filters && filters.communicationPlanIds) {
        inputCommPlanIds = filters.communicationPlanIds;
    }
    if (filters && filters.planFilters) {
        inputPlanFilters = filters.planFilters;
    }

    let filterConditions = {};
    const validateFilter = function(filters, inputFilters, type) {
        let errorMessages = [];
        let inValidfilters = inputFilters.filter(
            (x) => filters.indexOf(x.toUpperCase()) == -1
        );
        if (inValidfilters.length > 0) {
            errorMessages.push(
                inValidfilters.join(",") + " is/are invalid " + type + " filters."
            );
        }
        filterConditions =
            communicationDetailsTaskFilterUtil.evaluateFilterConditions(
                filters,
                inputFilters
            );
        return errorMessages;
    };
    let result = api.data.get_task_communication_details.output;
    if (
        !result ||
        Object.entries(result).length == 0
    ) {
        controllerOutput.status = false;
        controllerOutput.error_messages.push(
            translatedMessages.ICT_DATA_PROCESSED_FAILURE_MESSAGE
        );
    } else {

        let errorMessages = validateFilter(planFilterValues, inputPlanFilters, "plan"); // validate plan filters
        if (errorMessages.length > 0) {
            controllerOutput.error_messages = controllerOutput.error_messages.concat(errorMessages);
        }
        // Filter comm plans based on filters provided in input object
        let filteredData = await communicationDetailsTaskFilterUtil.filterPlanData(result.comm_plan, inputCommPlanIds, true, true, filterConditions, inputPlanFilters, helpers);
        let commPlanData = filteredData.commPlanData;
        let errorMessage = filteredData.errorMessage;
        if (errorMessage) controllerOutput.error_messages.push(errorMessage);
        result.comm_plan = commPlanData.commPlans;
        result.hasCollabChat = commPlanData.hasCollabChat;
        result.hasCollabCalls = commPlanData.hasCollabCalls;
        result.filteredPlans = commPlanData.filteredPlans;
        filteredData = await communicationDetailsTaskFilterUtil.filterPlanData(result.commTasksByPlan, inputCommPlanIds, false, false, filterConditions, inputPlanFilters, helpers);
        result.commTasksByPlan = filteredData.commPlanData.commPlans;
        commPlanData = await communicationDetailsTaskFilterUtil.filterStatusData(result.commTasksByState, inputCommPlanIds, false, filterConditions, inputPlanFilters, helpers);
        result.commTasksByState = commPlanData.commPlans;
        controllerOutput.ICT_DATA = result; // Output Object
        controllerOutput.status = true;
        controllerOutput.success_messages.push(
            translatedMessages.ICT_DATA_PROCESSED_SUCCESS_MESSAGE
        );
    }
    communicationDetailsTaskFilterUtil.filteredDataOutput(api, controllerOutput);
}
