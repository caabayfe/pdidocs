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
    api.setState('hideLoader', true);
    const message = await helpers.translate('Field filled by Now Assist');
    const genAiOutput = api.data.get_sow_modal_data_by_genai_1.output;
    if (!genAiOutput || !Object.keys(genAiOutput).length) 
        return;
    
    const nowRecordFormBlob = { ...api.data.glide_form_1.nowRecordFormBlob };
    if (genAiOutput.status == 'success') {
        let feedbackInputs = { ...api.state.feedbackInputs
        };
        var response = genAiOutput.response ? genAiOutput.response : "";
        var responseObj = response ? JSON.parse(response) : {};
        feedbackInputs.logId = genAiOutput.logId;
        feedbackInputs.isResponseEdited = false;
        feedbackInputs.originalResponse = response;
        api.setState('feedbackInputs', feedbackInputs);
        let fields = nowRecordFormBlob && nowRecordFormBlob.fields;
        if (response && fields) {
            for (let fieldName in fields) {
                if (fields.hasOwnProperty(fieldName) && !fields[fieldName].value) {
                    let value = responseObj[fieldName];
                    if (value) {
                        api.data.glide_form_1.nowRecordFormBlob.gForm.setValue(fieldName, value);
                        api.data.glide_form_1.nowRecordFormBlob.gForm.showFieldMsg(fieldName, message, "info");
                    }
                }
            }
        }

        return;
    } 
    
    if (genAiOutput.message || genAiOutput.error) {
        api.setState('errorMessage', { 
            type: genAiOutput.status === 'error' ? 'critical' : 'info', 
            icon: genAiOutput.status === 'error' ? 'exclamation-triangle-outline' : 'circle-info-outline',
            message: genAiOutput.message || genAiOutput.error });
        api.setState('hideErrorMessage', false);
    }
}
