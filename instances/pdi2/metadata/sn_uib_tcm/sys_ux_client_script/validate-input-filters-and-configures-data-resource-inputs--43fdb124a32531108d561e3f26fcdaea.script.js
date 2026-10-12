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
    const taskSysId = api.context.props.taskSysId;
    const taskTable = api.context.props.taskTable;
    const filters = event.payload.filters;
    api.setState("filters", filters);
    const communicationDetailsTaskFilterUtil = imports["sn_uib_tcm.CommunicationDetailsTaskFilterUtil"]();
    const controllerConstants = communicationDetailsTaskFilterUtil.CONSTANTS;
    const translatedMessages = await communicationDetailsTaskFilterUtil.getTranslatedMessages(helpers);
    let controllerOutput = communicationDetailsTaskFilterUtil.getOutputTemplate(); // controller output template
    // check for mandatory inputs
    if (!taskSysId || !taskTable) {
        controllerOutput.status = false;
        controllerOutput.error_messages.push(
            translatedMessages.INVALID_INPUT_ERROR_MESSAGE
        );
        communicationDetailsTaskFilterUtil.filteredDataOutput(
            api,
            controllerOutput
        );
        return;
    }
    // Type check for communicationPlanId,filter inputs
    if (
        filters &&
        ((filters.communicationPlanIds &&
                !(filters.communicationPlanIds instanceof Array)) ||
            (filters.planFilters && !(filters.planFilters instanceof Array)) ||
            (filters.dataFilters && !(filters.dataFilters instanceof Array)))
    ) {
        controllerOutput.status = false;
        controllerOutput.error_messages.push(
            translatedMessages.INVALID_FILTERS_ERROR_MESSAGE
        );
        communicationDetailsTaskFilterUtil.filteredDataOutput(
            api,
            controllerOutput
        );
        return;
    }
    let suppressICTData =
        controllerConstants.FILTERS.DATA_FILETRS.SUPRESSCOMMPLANS;
    let directChat = controllerConstants.FILTERS.DATA_FILETRS.DIRECTCHAT;
    let directCall = controllerConstants.FILTERS.DATA_FILETRS.DIRECTCALL;
    let getICTData = true;
    const getIndexOfFilter = (filters, filterName) =>
        filters.findIndex((filter) => filterName === filter.toUpperCase());
    if (
        filters &&
        filters.dataFilters &&
        getIndexOfFilter(filters.dataFilters, suppressICTData) > -1
    ) {
        getICTData = false;
    }
    api.setState("getICTData", getICTData);
    if (
        filters &&
        filters.dataFilters &&
        getIndexOfFilter(filters.dataFilters, directChat) > -1
    )
        api.data.fetch_all_direct_collaboration_chats.refresh();
    if (
        filters &&
        filters.dataFilters &&
        getIndexOfFilter(filters.dataFilters, directCall) > -1
    )
        api.data.fetch_notify_conference_calls.refresh();

    //Refresh task communication data
    if (getICTData) {
        /*
         * In playbook(Communication, collaboration, adhoc comm), the refresh is being call thrice immediately which is making the activity to not render data intermittently.
         * This delay will refresh the data broker one activity after another and the data renders properly.
         */
        helpers.timing.setTimeout(() => {
            api.data.get_task_communication_details.refresh();
        }, 100);
    }
}
