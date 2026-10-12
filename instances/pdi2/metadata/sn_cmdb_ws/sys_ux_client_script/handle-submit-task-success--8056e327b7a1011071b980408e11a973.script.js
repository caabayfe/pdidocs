/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { 
        handleSubmitTaskSuccess,
        getFormFields
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();
    if (event && event.payload && event.payload.data && event.payload.data.output) {
        if (!event.payload.data.output.error) {
            const {
                attestedCICount,
                rejectedCICount,
                nextScheduledReview,
                excludedCICount,
                duplicateCICount
            } = event.payload.data.output;
            const taskSummaryObj = {};
            const emit = api.emit;
            const translate = helpers.translate;
            const openModal = helpers.modal.open;

            const formFields = getFormFields(api.data.record);
            if (formFields.assigned_to) {
                taskSummaryObj.assigneeName = formFields.assigned_to.displayValue;
            }
            taskSummaryObj.attestedCICount = attestedCICount;
            taskSummaryObj.rejectedCICount = rejectedCICount;
            taskSummaryObj.nextScheduledReview = nextScheduledReview;
            taskSummaryObj.excludedCICount = excludedCICount;
            taskSummaryObj.duplicateCICount = duplicateCICount;

            await handleSubmitTaskSuccess('viewport_loq', taskSummaryObj, emit, translate, openModal);
        }
        else {
            // There was a problem when trying to submit task.
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert1',
                    status: 'critical',
                    icon: 'info-circle-outline',
                    content: await helpers.translate('An error occurred while submitting this task. Contact your administrator for further details.'),
                    action: { type: 'dismiss' }
                }]
            });
        }
    }
	
}
