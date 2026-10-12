/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const success = event.payload.data.output.data.now.wrapUpSegment.updateSegment.success;
    const segmentUpdateErrorMessage = await helpers.translate("API Failure - Could not update segment with wrap up details. Please contact your support team or system admin.");
        
    if (success) {
        api.emit("WRAP_UP#WRAP_UP_COMPLETED", {});
    } else {
        api.emit("WRAP_UP#ADD_NOTIFICATION", {
            message: segmentUpdateErrorMessage,
        });
    }
}
