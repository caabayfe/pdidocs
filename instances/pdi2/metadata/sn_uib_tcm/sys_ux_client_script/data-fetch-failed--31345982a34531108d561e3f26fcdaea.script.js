/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
  // Handles data fetch failure data brokers
    if (event.payload.errors) {
        const communicationDetailsTaskFilterUtil = imports['sn_uib_tcm.CommunicationDetailsTaskFilterUtil']();
        let controllerOutput = communicationDetailsTaskFilterUtil.getOutputTemplate();
        let errors = event.payload.errors;

        controllerOutput.type = communicationDetailsTaskFilterUtil.getOutputType(event.payload.dataElemId);
        controllerOutput.status = false;
        errors.forEach((error) => {
            controllerOutput.error_messages.push(error.message || error);
        });
        communicationDetailsTaskFilterUtil.filteredDataOutput(api, controllerOutput);
    }
}
